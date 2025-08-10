import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import FirebaseSigninView from '../views/FirebaseSigninView.vue'
import FirebaseRegisterView from '../views/FirebaseRegisterView.vue'
import AddBookView from '../views/AddBookView.vue'
import BookListView from '../components/BookList.vue'
import UpdateWithDeleteBookView from '../views/UpdateWithDeleteBookView.vue'
import WeatherView from '../views/WeatherView.vue'
import CountBookAPI from '../views/CountBookAPI.vue'
const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/about',
        name: 'About',
        component: AboutView
    },
    {
        path: '/FireLogin',
        name: 'FireLogin',
        component: FirebaseSigninView
    },
    {
        path: '/FireRegister',
        name: 'FireRegister',
        component: FirebaseRegisterView
    },
    {
        path: '/addbook',
        name: 'AddBook',
        component: AddBookView
    },
    {
        path: '/booklist',
        name: 'BookList',
        component: BookListView
    },
    {
        path: '/updateWithdelete',
        name: 'UpdateDelete',
        component: UpdateWithDeleteBookView
    },
    {
        path: '/WeatherCheck',
        name: 'WeatherCheck',
        component: WeatherView
    },
    {
        path: '/CountBookAPI',
        name: 'CountBookAPI',
        component: CountBookAPI
    },
    
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router