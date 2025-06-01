import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Auth from '../views/Auth.vue';
import Profile from '../views/Profile.vue';
import Hiscores from '../views/Hiscores.vue';
import Shop from "../views/Shop.vue";
import Admin from "../views/AdminDashboard.vue";
import News from "../views/NewsPostPage.vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { title: 'Warwyn - Home' }
    },
    {
        path: '/news/:id',
        name: 'NewsPost',
        component: News,
        meta: { title: 'Warwyn News' }
    },
    {
        path: '/login',
        name: 'Login',
        component: Auth,
        meta: { title: 'Warwyn - Login' }
    },
    {
        path: '/register',
        name: 'Register',
        component: Auth,
        meta: { title: 'Warwyn - Register' }

    },
    {
        path: '/profile',
        component: Profile,
        meta: { title: 'Warwyn - Your Profile', requiresAuth: true },
        redirect: '/profile/home',
        children: [
            {
                path: 'home',
                component: () => import('../components/profile/MainDashboard.vue'),
                meta: { title: 'Dashboard | Profile' }
            },
            {
                path: 'settings',
                component: () => import('../components/profile/AccountSettings.vue'),
                meta: { title: 'Settings | Profile' }
            },
            {
                path: 'status',
                component: () => import('../components/profile/AccountStatus.vue'),
                meta: { title: 'Status | Profile' }
            }
        ]
    },
    {
        path: '/hiscores',
        name: 'Hiscores',
        component: Hiscores,
        meta: { title: 'Warwyn - Hiscores' }
    },
    {
        path: '/shop',
        name: 'Warwyn Shop',
        component: Shop,
        meta: { title: 'Warwyn - Donator Shop', requiresAuth: true }
    },
    {
        path: '/admin',
        component: Admin,
        meta: { title: 'Admin', requiresAuth: true, staffOnly: true, adminOnly: true },
        redirect: '/admin/home',
        children: [
            {
                path: 'home',
                component: () => import('../components/admin/AdminHome.vue'),
                meta: { title: 'Dashboard | Warwyn Admin' }
            },
            {
                path: 'users',
                component: () => import('../components/admin/AdminUsers.vue'),
                meta: { title: 'Users | Warwyn Admin' }
            },
            {
                path: 'shop',
                component: () => import ('../components/admin/AdminShop.vue'),
                meta: { title: 'Shop | Warwyn Admin' }
            },
            {
                path: 'shop-logs',
                component: () => import('../components/admin/AdminShopLogs.vue'),
                meta: { title: 'Shop Logs | Warwyn Admin' }
            },
            {
                path: 'news',
                component: () => import ('../components/admin/AdminNews.vue'),
                meta: { title: 'News | Warwyn Admin' }
            },
            {
                path: 'news/new',
                component: () => import('../components/admin/NewsPostEditor.vue'),
                meta: { title: 'News Post | Warwyn Admin' }
            },
            {
                path: 'news/edit/:id',
                component: () => import('../components/admin/NewsPostEditor.vue'),
                props: true,
                meta: { title: 'News Editor | Warwyn Admin' }
            },
            {
                path: 'contracts',
                component: () => import('../components/admin/ContractEditor.vue'),
                meta: { title: 'Contracts | Warwyn Admin' }
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth'
            }
        } else if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
});

export default router;