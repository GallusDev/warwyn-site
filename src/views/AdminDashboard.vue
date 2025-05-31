<template>
  <div class="admin-layout">
    <aside :class="{ collapsed: isCollapsed }">
      <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
        <font-awesome-icon :icon="['fas', isCollapsed ? 'chevron-right' : 'chevron-left']" />
      </button>

      <div class="nav-links">
        <router-link to="/admin/home">
          <font-awesome-icon icon="tachometer-alt" />
          <span v-if="!isCollapsed">Dashboard</span>
        </router-link>
        <router-link to="/admin/users">
          <font-awesome-icon icon="users" />
          <span v-if="!isCollapsed">Users</span>
        </router-link>
        <router-link to="/admin/shop">
          <font-awesome-icon icon="store" />
          <span v-if="!isCollapsed">Shop</span>
        </router-link>
        <router-link to="/admin/news">
          <font-awesome-icon icon="newspaper" />
          <span v-if="!isCollapsed">News</span>
        </router-link>
        <router-link to="/admin/contracts">
          <font-awesome-icon icon="scroll" />
          <span v-if="!isCollapsed">Contracts</span>
        </router-link>
      </div>
    </aside>

    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const isCollapsed = ref(false)
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

aside {
  width: 150px;
  background-color: var(--bg-darker);
  color: var(--text-light);
  padding: 1rem;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}

aside.collapsed {
  width: 30px;
}

.collapse-btn {
  background: none;
  border: none;
  padding: 0.2rem;
  cursor: pointer;
  color: var(--text-light);
  align-self: flex-start;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  transition: color 0.2s ease;
}

.collapse-btn:hover {
  color: var(--accent-hover);
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.nav-links a {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: var(--text-light);
  font-weight: bold;
}

.nav-links a.router-link-exact-active {
  color: var(--accent);
}

.admin-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>