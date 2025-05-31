<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
      <form class="narrow-form" @submit.prevent="handleSubmit">
        <!-- Registration-only field -->
        <input v-if="!isLogin" type="text" v-model="username" placeholder="Username" required />

        <!-- Always visible -->
        <input type="email" v-model="email" placeholder="Email" required />
        <input type="password" v-model="password" placeholder="Password" required />

        <!-- Registration-only confirmation -->
        <input v-if="!isLogin" type="password" v-model="confirmPassword" placeholder="Confirm Password" required />

        <button type="submit">{{ isLogin ? 'Login' : 'Register' }}</button>
      </form>

      <p class="toggle-link">
        <span v-if="isLogin">
          Don't have an account? <a href="#" @click.prevent="toggleForm">Sign up now</a>
        </span>
        <span v-else>
          Already have an account? <a href="#" @click.prevent="toggleForm">Log in now</a>
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from "../stores/user.js";
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const route = useRoute()
const router = useRouter()

const userStore = useUserStore()

const isLogin = computed(() => route.path === '/login')

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const toggleForm = () => {
  const targetPath = isLogin.value ? '/register' : '/login'
  router.push(targetPath)
}

const handleSubmit = async () => {
  if (isLogin.value) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
      const idToken = await userCredential.user.getIdToken();

      // Send the ID token to backend to set an HTTP-only cookie
      await fetch('http://localhost:3000/auth/web-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // allows browser to send cookies
        body: JSON.stringify({ idToken })
      })

      // Set global login state
      userStore.setLoggedIn(true, userCredential.user.displayName || email.value)


      const redirect = route.query.redirect || '/';
      router.push(redirect);
    } catch (err) {
      alert("Login failed: " + err.message)
    }
  } else {
    if (password.value !== confirmPassword.value) {
      alert("Passwords do not match.")
      return
    }

    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.value,
          email: email.value,
          password: password.value
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      alert('Registration successful! You can now log in.')
      router.push('/login')
    } catch (err) {
      alert("Registration failed: " + err.message)
    }
  }
}
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 1rem;
}

.auth-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.auth-card h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.toggle-link {
  margin-top: 1rem;
  text-align: center;
}

.toggle-link a {
  color: var(--accent);
  cursor: pointer;
}
</style>
