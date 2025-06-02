<template>
  <header class="main-header">
    <div class="nav-content">
      <div class="logo"><router-link to="/" @click="closeMenu">Warwyn</router-link></div>

      <button class="mobile-toggle" @click="menuOpen = !menuOpen">
        ☰
      </button>

      <nav :class="{ open: menuOpen }">
        <router-link to="/" @click="closeMenu" :class="{ active: $route.path === '/' }">Home</router-link>
        <a target="_blank" href="https://discord.gg/gEQS7BEX69">Discord</a>
        <router-link to="/hiscores" @click="closeMenu" :class="{ active: $route.path === '/hiscores' }">Hiscores</router-link>
        <router-link
            v-if="isLoggedIn"
            to="/polls"
            @click="closeMenu"
            :class="{ active: $route.path === '/polls' }"
        >Polls</router-link>
        <router-link to="/shop" @click="closeMenu" :class="{ active: $route.path === '/shop' }">Shop</router-link>

        <router-link
            v-if="isLoggedIn"
            to="/profile"
            @click="closeMenu"
            :class="{ active: $route.path === '/profile' }"
        >Profile</router-link>

        <a
            v-if="isLoggedIn"
            href="#"
            @click.prevent="logout"
        >Logout</a>

        <router-link
            v-else
            to="/login"
            @click="closeMenu"
            :class="{ active: ['/login', '/register'].includes($route.path) }"
        >Login</router-link>

        <router-link
            v-if="isLoggedIn && rights === 3"
            to="/admin"
            @click="closeMenu"
            :class="{ active: $route.path === '/admin' }"
        >
          Admin
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getApp } from 'firebase/app'

const router = useRouter()
const menuOpen = ref(false)

const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const rights = ref(0);

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/auth/verify', {
      credentials: 'include'
    })
    const data = await res.json()
    if (res.ok) {
      userStore.setLoggedIn(true, data.username)

      // Fetch Firestore user_rights
      const db = getFirestore(getApp())
      const userRef = doc(db, 'users', data.username)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        rights.value = userSnap.data().user_rights || 0
      }
    } else {
      userStore.setLoggedIn(false)
    }
  } catch {
    userStore.setLoggedIn(false)
  }
})

const closeMenu = () => {
  menuOpen.value = false
}

const logout = async () => {
  try {
    await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
    userStore.setLoggedIn(false)
    router.push('/')
  } catch (err) {
    console.error('Logout failed', err)
  }
}
</script>

<style scoped>
.main-header {
  width: 100%;
  background-color: var(--bg-darker);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
}

.nav-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent);
}

/* Hide toggle button by default */
.mobile-toggle {
  display: none;
  font-size: 1.8rem;
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
}

/* Desktop nav */
nav a,
nav .router-link {
  position: relative;
  color: var(--text-light);
  font-weight: bold;
  text-decoration: none;
  overflow: hidden;
  margin-right: 1.5rem;
}

nav a:last-child,
nav .router-link:last-child {
  margin-right: 0;
}

nav a::after,
nav .router-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0%;
  height: 2px;
  background-color: var(--accent);
  transition: width 0.3s ease, left 0.3s ease;
  transform: translateX(-50%);
}

nav a:hover::after,
nav .router-link:hover::after {
  width: 100%;
  left: 50%;
}

nav a:hover,
nav .router-link:hover {
  color: var(--accent-hover);
}

nav a.active,
nav .router-link.active {
  color: var(--accent);
}

/* Mobile styles */
@media (max-width: 768px) {
  .mobile-toggle {
    display: block;
  }

  nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--bg-darker);
    flex-direction: column;
    align-items: center;
    display: none;
    padding: 1rem 0;
    z-index: 1000;
  }

  nav.open {
    display: flex;
  }

  nav a {
    padding: 0.75rem 0;
    width: 100%;
    text-align: center;
  }

  nav a.active {
    color: var(--accent);
    border-bottom: 2px solid var(--accent);
  }
}
</style>
