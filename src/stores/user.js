import { defineStore } from "pinia";
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const isLoggedIn = ref(false)
    const username = ref(null)

    const setLoggedIn = (value, name = null) => {
        isLoggedIn.value = value
        username.value = name
    }

    return { isLoggedIn, username, setLoggedIn }
})