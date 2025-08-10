<template>
    <div>
        <h1>Add Book</h1>
        <form @submit.prevent="addBook" class="add-form">
            <div>
                <label for="new-isbn">ISBN:</label>
                <input type="text" v-model="newBook.isbn" id="new-isbn" required />
            </div>
            <div>
                <label for="new-name">Name:</label>
                <input type="text" v-model="newBook.name" id="new-name" required />
            </div>
            <button type="submit">Add Book</button>
        </form>

        <hr />

        <h1>Book List</h1>

        <!-- Query Controls -->
        <div class="query-controls">
            <div>
                <label for="search">Search by Name (WHERE):</label>
                <input type="text" v-model="searchQuery" id="search" placeholder="Enter book name..." />
            </div>
            <div>
                <label for="order-by">Order By (ORDER BY):</label>
                <select v-model="orderByField" id="order-by">
                    <option value="name">Name</option>
                    <option value="isbn">ISBN</option>
                </select>
                <select v-model="orderByDirection">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
            <div>
                <label for="limit">Limit Results (LIMIT):</label>
                <input type="number" v-model.number="limitCount" id="limit" min="1" />
            </div>
        </div>


        <div v-if="books.length">
            <table>
                <thead>
                    <tr>
                        <th>ISBN</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="book in books" :key="book.id">

                        <template v-if="editingBookId === book.id">

                            <td><input type="text" v-model="editFormData.isbn" /></td>
                            <td><input type="text" v-model="editFormData.name" /></td>
                            <td>
                                <button @click="updateBook()" class="save-btn">Save</button>
                                <button @click="cancelEdit()" class="cancel-btn">Cancel</button>
                            </td>
                        </template>
                        <template v-else>

                            <td>{{ book.isbn }}</td>
                            <td>{{ book.name }}</td>
                            <td>
                                <button @click="startEdit(book)" class="edit-btn">Edit</button>
                                <button @click="removeBook(book.id)" class="delete-btn">Delete</button>
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else>
            <p>Loading books or no books found with the current filters...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watchEffect } from 'vue';
import db from '../firebase/init.js';
// Import query-building functions from Firestore
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';


const newBook = reactive({
    isbn: '',
    name: ''
});


const books = ref([]);


const editingBookId = ref(null);
const editFormData = reactive({
    isbn: '',
    name: ''
});

// --- NEW: Refs for query controls ---
const searchQuery = ref('');
const orderByField = ref('name'); // Default sort field
const orderByDirection = ref('asc'); // Default sort direction
const limitCount = ref(5); // Default limit


// The 'books' collection reference
const booksCollectionRef = collection(db, 'books');

// --- REPLACED onMounted with watchEffect for dynamic queries ---
watchEffect(() => {
    // This function will re-run automatically whenever a ref used inside it changes 
    // (e.g., searchQuery, orderByField, limitCount)

    // Start building the query array.
    const queryConstraints = [];

    // 1. Add ORDER BY clause
    // The orderBy clause must come before most `where` clauses in Firestore queries.
    queryConstraints.push(orderBy(orderByField.value, orderByDirection.value));

    // 2. Add WHERE clause for searching
    if (searchQuery.value) {
        // This query finds documents where 'name' starts with the search query.
        // It uses a range comparison which is a standard Firestore pattern for "starts-with" searches.
        queryConstraints.push(where('name', '>=', searchQuery.value));
        queryConstraints.push(where('name', '<=', searchQuery.value + '\uf8ff'));
    }

    // 3. Add LIMIT clause
    if (limitCount.value > 0) {
        queryConstraints.push(limit(limitCount.value));
    }

    // Construct the final query object
    const q = query(booksCollectionRef, ...queryConstraints);


    // Use onSnapshot to listen for real-time updates from the constructed query
    const unsubscribe = onSnapshot(q, (snapshot) => {
        books.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }, (error) => {
        console.error("Firebase query error: ", error);
        alert("An error occurred. You might need to create a Firestore index. Check the browser console for a link.");
    });

    // watchEffect returns a cleanup function, but onSnapshot's own returned
    // `unsubscribe` function handles listener cleanup effectively when the component unmounts.
});


const addBook = async () => {
    if (!newBook.isbn || !newBook.name) {
        alert('Both fields are required.');
        return;
    }
    try {
        const isbnNumber = Number(newBook.isbn);
        if (isNaN(isbnNumber)) {
            alert('ISBN must be a valid number');
            return;
        }
        await addDoc(booksCollectionRef, {
            isbn: isbnNumber,
            name: newBook.name
        });

        newBook.isbn = '';
        newBook.name = '';
        alert('Book added successfully!');
    } catch (error) {
        console.error('Error adding book: ', error);
    }
};


const removeBook = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }
    try {
        await deleteDoc(doc(db, 'books', id));
        alert('Book deleted successfully!');
    } catch (error) {
        console.error('Error deleting book: ', error);
    }
};


const startEdit = (book) => {
    editingBookId.value = book.id;

    editFormData.isbn = book.isbn;
    editFormData.name = book.name;
};


const cancelEdit = () => {
    editingBookId.value = null;

};


const updateBook = async () => {
    if (!editingBookId.value) return;

    try {
        const isbnNumber = Number(editFormData.isbn);
        if (isNaN(isbnNumber)) {
            alert('ISBN must be a valid number');
            return;
        }
        const bookRef = doc(db, 'books', editingBookId.value);
        await updateDoc(bookRef, {
            isbn: isbnNumber,
            name: editFormData.name
        });
        alert('Book updated successfully!');

        cancelEdit();
    } catch (error) {
        console.error('Error updating book: ', error);
    }
};

</script>

<style scoped>
.add-form {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.add-form div {
    margin-bottom: 10px;
}

label {
    margin-right: 10px;
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
}

input,
select {
    padding: 8px;
    width: 250px;
    box-sizing: border-box;
}

hr {
    margin: 30px 0;
}

.query-controls {
    background-color: #f9f9f9;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-bottom: 20px;
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: flex-end;
}

.query-controls div {
    display: flex;
    flex-direction: column;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ccc;
    padding: 10px;
    text-align: left;
}

th {
    background-color: #f4f4f4;
}

td input {
    width: 95%;
}

button {
    padding: 8px 12px;
    margin-right: 5px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 3px;
}

.edit-btn {
    background-color: #ffc107;
}

.save-btn {
    background-color: #28a745;
    color: white;
}

.delete-btn {
    background-color: #dc3545;
    color: white;
}

.cancel-btn {
    background-color: #6c757d;
    color: white;
}</style>