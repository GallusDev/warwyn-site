<template>
  <div class="news-post-page" v-if="post">
    <router-link :to="{ path: '/', hash: '#news' }" class="back-link">
      <font-awesome-icon :icon="['fas', 'chevron-left']" /> Back to News
    </router-link>
    <div class="header">
      <img :src="post.displayImage" alt="Display" class="post-img" />
      <div>
        <h1 class="post-title">{{ post.title }}</h1>
        <p class="meta">
          <span class="date">{{ formattedDate }}</span>
          <span class="category"> | {{ post.category }}</span>
        </p>
      </div>
    </div>

    <hr />

    <div class="post-content" v-html="post.content"></div>
  </div>
  <div v-else class="loading">Loading post...</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const route = useRoute()
const post = ref(null)

const fetchPost = async () => {
  const id = route.params.id
  if (!id) return
  const snap = await getDoc(doc(db, 'news_posts', id))
  if (snap.exists()) {
    post.value = { ...snap.data(), id: snap.id }
  }
}

onMounted(fetchPost)

const formattedDate = computed(() => {
  if (!post.value?.createdAt?.toDate) return ''
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(post.value.createdAt.toDate())
})
</script>

<style scoped>
.news-post-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #1e1e1e;
  border-radius: 8px;
  color: #fff;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}

.back-link {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  color: var(--text-light);
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--accent-hover);
  cursor: pointer;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.post-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #444;
}

.post-title {
  margin: 0;
  font-size: 1.8rem;
}

.meta {
  font-size: 0.9rem;
  font-style: italic;
  color: #aaa;
}

hr {
  border: 0;
  height: 1px;
  background: #444;
  margin: 1.5rem 0;
}

.post-content {
  line-height: 1.6;
  color: #ddd;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #ccc;
}
</style>