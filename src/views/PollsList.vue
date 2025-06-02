<template>
  <div class="container">
    <h2 v-if="currentPolls.length">Current Poll<span v-if="currentPolls.length > 1">s</span></h2>
    <div class="poll-card" v-for="poll in currentPolls" :key="poll.id" @click="goToPoll(poll.id)">
      <h3>{{ poll.title }}</h3>
      <p>Ends {{ formatDate(poll.endTime) }}</p>
    </div>

    <h2 v-if="previousPolls.length">Previous Polls</h2>
    <div class="poll-card" v-for="poll in paginatedPreviousPolls" :key="poll.id" @click="goToPoll(poll.id)">
      <h3>{{ poll.title }}</h3>
      <p>Ended {{ formatDate(poll.endTime) }}</p>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="currentPage--" :disabled="currentPage === 1">Prev</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const polls = ref([])
const currentPage = ref(1)
const pollsPerPage = 3
const router = useRouter()

const fetchPolls = async () => {
  const res = await axios.get('http://localhost:3000/api/polls')
  polls.value = res.data
}

const currentPolls = computed(() => polls.value.filter(p => !p.ended))
const previousPolls = computed(() => polls.value.filter(p => p.ended))

const paginatedPreviousPolls = computed(() => {
  const start = (currentPage.value - 1) * pollsPerPage
  return previousPolls.value.slice(start, start + pollsPerPage)
})

const totalPages = computed(() => Math.ceil(previousPolls.value.length / pollsPerPage))

function formatDate(ts) {
  // If it's already a Date, just format it
  if (ts instanceof Date) return ts.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // If it's a Firestore Timestamp (from JSON), convert manually
  if (ts && typeof ts._seconds === 'number') {
    const date = new Date(ts._seconds * 1000);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return 'Invalid Date';
}

const goToPoll = (id) => router.push(`/polls/${id}`)

onMounted(fetchPolls)
</script>

<style scoped>
.poll-card {
  cursor: pointer;
  border: 1px solid #444;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #222;
  border-radius: 6px;
}
.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}
</style>