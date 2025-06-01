import { createApp } from 'vue';
import { createPinia } from "pinia";
import App from './App.vue';
import router from './router';
import './style.css';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

// Font Awesome Setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTachometerAlt, faUsers, faStore, faGift, faChevronLeft, faChevronRight, faScroll, faNewspaper, faCartShopping } from '@fortawesome/free-solid-svg-icons'

library.add(faTachometerAlt, faUsers, faStore, faGift, faChevronLeft, faChevronRight, faScroll, faNewspaper, faCartShopping)

// Navigation Guard
router.beforeEach(async (to, from, next) => {
    const defaultTitle = 'Warwyn';
    document.title = to.meta.title || defaultTitle;

    if (!to.meta.requiresAuth) return next();

    try {
        const res = await fetch('http://localhost:3000/auth/verify', {
            credentials: 'include'
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        // Reject if adminOnly and not admin
        if (to.meta.adminOnly && data.user_rights !== 3) {
            alert("Admins only.");
            return next('/');
        }

        // If route requires staff, check user_rights
        if (to.meta.staffOnly && data.user_rights < 1) {
            alert("You do not have permission to access this page.");
            return next('/');
        }

        next();
    } catch {
        next({ path: '/login', query: { redirect: to.fullPath } });
    }
});

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app');