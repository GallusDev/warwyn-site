<template>
  <div class="container">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Welcome to Warwyn</h1>
        <p>Relive the glory days of RuneScape in our classic private server experience.</p>
        <button>Play Now</button>
      </div>
    </section>

    <section class="features-section">
      <h2>Features</h2>
      <div class="features-grid">
        <div v-for="(feature, index) in features" :key="index" class="feature-card">
          <div class="feature-icon">
            <img :src="feature.icon" alt="icon" width="115" height="111" />
          </div>
          <div class="feature-title">{{ feature.title }}</div>
        </div>
      </div>
    </section>

    <section class="news-section" id="news">
      <h2>Latest News</h2>
      <div class="mosaic-grid">
        <div class="news-mosaic" v-for="(news, index) in newsPosts" :key="index">
          <div class="news-date">{{ formatDate(news.createdAt) }}</div>
          <img :src="news.icon" alt="icon" class="news-icon" />
          <h3>{{ news.title }}</h3>
          <p>
            {{ news.teaser }}
            <router-link :to="`/news/${news.id}`">Read more!</router-link>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

import questsIcon from '../assets/imgs/features/quests.png'
import devIcon from '../assets/imgs/features/dev.png'
import bossingIcon from '../assets/imgs/features/bossing.png'
import skillContractsIcon from '../assets/imgs/features/skill_contracts.png'

const features = [
  { icon: questsIcon, title: '35+ Quests' },
  //{ icon: devIcon, title: 'Ongoing Development' },
  { icon: bossingIcon, title: 'Ferocious Bosses' },
  { icon: skillContractsIcon, title: 'Skilling Contracts' },
]

const newsPosts = ref([])

function formatDate(date) {
  if (!date) return 'Unknown date'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const fetchNewsPosts = async () => {
  const q = query(
      collection(db, 'news_posts'),
      orderBy('createdAt', 'desc'),
      limit(6)
  )

  const snapshot = await getDocs(q)
  newsPosts.value = snapshot.docs.map(doc => {
    const data = doc.data()
    const raw = stripHtml(data.content)
    const teaser = truncateToWord(raw, 75)
    return {
      id: doc.id,
      title: data.title,
      icon: data.displayImage,
      teaser: `${teaser}... `,
      createdAt: data.createdAt?.toDate?.() || null
    }
  })
}

const truncateToWord = (text, maxLength) => {
  if (text.length <= maxLength) return text
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)
}

// Utility to strip HTML tags from content
const stripHtml = html => html.replace(/<[^>]*>/g, '')

onMounted(fetchNewsPosts)
</script>

<style scoped>
.hero-section {
  position: relative;
  background-image: url('../assets/imgs/hero-bg.png'); /* Replace with your actual image */
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.hero-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6); /* overlay */
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 4rem 2rem;
  text-align: center;
  color: white;
}

.features-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.feature-card {
  flex: 1 1 280px;
  max-width: 300px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  text-align: center;
  padding: 1.5rem;
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--accent);
}

.feature-title {
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--text-light);
}

.news-section {
  padding: 2rem;
  color: #fff;
}

.mosaic-grid {
  column-count: 3;
  column-gap: 1rem;
}

.news-mosaic {
  background-color: #1e1e1e;
  margin-bottom: 1rem;
  border-radius: 8px;
  padding: 1rem;
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  break-inside: avoid;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
  transition: transform 0.2s ease;
  position: relative;
  padding-top: 2rem;
}

.news-mosaic:hover {
  transform: scale(1.02);
}

.news-icon {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 0.5rem;
}

.news-date {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  font-size: 0.75rem;
  font-weight: bold;
  color: var(--text-light);
  opacity: 0.7;
}

@media (max-width: 1024px) {
  .mosaic-grid {
    column-count: 2;
  }
}

@media (max-width: 600px) {
  .mosaic-grid {
    column-count: 1;
  }
}
</style>
