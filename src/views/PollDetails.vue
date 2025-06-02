<template>
  <div class="container">
    <h2>{{ poll?.title }}</h2>

    <div v-if="poll">
      <div v-for="(question, qIndex) in poll.questions" :key="qIndex" class="question-block">
        <h3>Q{{ qIndex + 1 }}: {{ question.question }}</h3>
        <ul>
          <li
              v-for="(answer, aIndex) in question.answers"
              :key="aIndex"
              :class="{ 'winner': showResults && isWinningAnswer(question.answers, aIndex) }"
          >
            <label v-if="!showResults">
              <input
                  type="radio"
                  :name="`question-${qIndex}`"
                  :value="aIndex"
                  v-model="selectedAnswers[qIndex]"
              />
              {{ answer.text }}
            </label>
            <span v-else>
              {{ answer.text }} - {{ calculatePercentage(question.answers, answer.votes) }}%
            </span>
          </li>
        </ul>
      </div>

      <button
          v-if="!showResults && canVote"
          class="vote-btn"
          :disabled="!allQuestionsAnswered"
          @click="submitVote"
      >
        Vote
      </button>
    </div>

    <p v-else>Loading poll...</p>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getApp } from 'firebase/app'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const pollId = route.params.id
const API_URL = `http://localhost:3000/api/polls/${pollId}`

const poll = ref(null)
const selectedAnswers = ref([])
const user = ref(null)

const fetchPoll = async () => {
  try {
    const res = await axios.get(API_URL)
    poll.value = res.data
  } catch (err) {
    console.error('Failed to load poll:', err)
  }
}

const fetchUser = async () => {
  try {
    const res = await fetch('http://localhost:3000/auth/verify', {
      credentials: 'include'
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'Auth verification failed.')

    // Get Firestore metadata
    const db = getFirestore(getApp())
    const userRef = doc(db, 'users', data.username)
    const userSnap = await getDoc(userRef)

    user.value = {
      username: data.username,
      ...(userSnap.exists() ? userSnap.data() : {}),
    }

    // Default to empty voted_polls if not present
    if (!user.value.voted_polls) {
      user.value.voted_polls = []
    }

  } catch (err) {
    console.error('Failed to fetch user:', err)
  }
}


const canVote = computed(() => {
  return !poll.value?.ended && !user.value?.voted_polls?.includes(pollId)
})

const showResults = computed(() => {
  return poll.value?.ended || user.value?.voted_polls?.includes(pollId)
})

const allQuestionsAnswered = computed(() => {
  return selectedAnswers.value.length === poll.value?.questions?.length && selectedAnswers.value.every(index => index !== undefined)
})

const submitVote = async () => {
  try {
    const answerIndexes = poll.value.questions.map((_, qIndex) => selectedAnswers.value[qIndex]);

    await axios.post(`${API_URL}/vote`, {
      answers: answerIndexes,
      username: user.value.username
    });

    await fetchPoll();
    await fetchUser();
  } catch (err) {
    console.error('Failed to submit vote:', err);
  }
};

const calculatePercentage = (answers, votes) => {
  const totalVotes = answers.reduce((sum, a) => sum + (a.votes || 0), 0);
  const safeVotes = votes || 0;

  if (totalVotes === 0) return 0;

  return Math.floor((safeVotes / totalVotes) * 100);
};

const isWinningAnswer = (answers, index) => {
  const maxVotes = Math.max(...answers.map(a => a.votes || 0))
  return answers[index].votes === maxVotes && maxVotes > 0
}

onMounted(async () => {
  await fetchUser()
  await fetchPoll()
})
</script>

<style scoped>
.poll-detail {
  max-width: 700px;
  margin: auto;
  padding: 2rem;
  color: #eee;
}

.question-block {
  margin-bottom: 1.5rem;
  background: #2a2a2a;
  padding: 1rem;
  border-radius: 6px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 0.5rem 0;
  padding: 0.3rem;
  border-radius: 4px;
}

li.winner {
  background-color: #2d613f;
}

.vote-btn {
  padding: 0.5rem 1rem;
  background: #444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>