<template>
  <div class="polls-page">
    <button v-if="!showCreateForm" class="create-btn small-btn" @click="startCreatingPoll">Create Poll</button>

    <div v-if="showCreateForm" class="create-form">
      <h3>{{ editingPoll ? 'Edit Poll' : 'Create a New Poll' }}</h3>

      <div class="field vertical">
        <label>Poll Title:</label>
        <input type="text" v-model="newPoll.title" placeholder="Enter poll title..." />
      </div>

      <div class="field vertical">
        <label>End Date/Time:</label>
        <input type="datetime-local" v-model="newPoll.endTime" />
      </div>

      <div v-for="(question, qIndex) in newPoll.questions" :key="qIndex" class="question-block">
        <div class="field vertical">
          <label>Question {{ qIndex + 1 }}:</label>
          <input type="text" v-model="question.question" placeholder="Enter question text..." />
        </div>

        <div class="field vertical">
          <label>Answers:</label>
          <div v-for="(answer, aIndex) in question.answers" :key="aIndex" class="answer-row">
            <input type="text" v-model="answer.text" placeholder="Answer option..." />
            <button
                v-if="question.answers.length > 2"
                class="remove-answer-btn"
                @click="removeAnswer(qIndex, aIndex)"
                title="Remove this answer"
            >
              ❌
            </button>
          </div>
          <button class="add-answer small-btn" @click="addAnswer(qIndex)">+</button>
        </div>

        <button class="remove-answer-btn" v-if="newPoll.questions.length > 1" @click="removeQuestion(qIndex)">Remove Question</button>
        <hr />
      </div>

      <button class="add-answer small-btn" @click="addQuestion">Add Question</button>

      <div class="actions">
        <button class="submit-btn small-btn" @click="submitPoll">{{ editingPoll ? 'Update Poll' : 'Submit Poll' }}</button>
        <button class="small-btn" @click="cancelCreate">Cancel</button>
        <button v-if="editingPoll" class="small-btn" @click="deletePoll">Delete</button>
      </div>
    </div>

    <div v-if="polls.length && !showCreateForm" class="poll-list">
      <div v-for="poll in polls" :key="poll.id" class="poll-card">
        <h4>{{ poll.title }}</h4>
        <p class="countdown">
          <span v-if="poll.ended">Ended</span>
          <span v-else>
            Ends {{ poll.formattedEndTime }}<br />
            <small v-if="countdowns[poll.id] !== 'Ended'">({{ countdowns[poll.id] }} remaining)</small>
          </span>
        </p>
        <div v-for="(question, index) in poll.questions" :key="index" class="question-preview">
          <strong>Q{{ index + 1 }}: {{ question.question }}</strong>
          <ul>
            <li v-for="(answer, aIdx) in question.answers" :key="aIdx">- {{ answer.text }}</li>
          </ul>
        </div>
        <div class="card-actions">
          <button v-if="!poll.ended" class="small-btn" @click="endPoll(poll.id)">End Poll</button>
          <button v-if="!poll.ended" class="small-btn" @click="startEditingPoll(poll)">Edit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api/polls'
const showCreateForm = ref(false)
const editingPoll = ref(null)
const polls = ref([])
const countdowns = ref({})

const newPoll = ref({
  title: '',
  endTime: '',
  questions: [
    {
      question: '',
      answers: [{ text: '' }, { text: '' }]
    }
  ]
});

const addQuestion = () => {
  newPoll.value.questions.push({ question: '', answers: [{ text: '' }, { text: '' }] });
};

const removeQuestion = (index) => {
  if (newPoll.value.questions.length > 1) newPoll.value.questions.splice(index, 1);
};

const addAnswer = (qIndex) => {
  newPoll.value.questions[qIndex].answers.push({ text: '' });
};

const removeAnswer = (qIndex, aIndex) => {
  const question = newPoll.value.questions[qIndex];
  if (question.answers.length > 2) {
    question.answers.splice(aIndex, 1);
  }
};

const startCreatingPoll = () => {
  editingPoll.value = null
  newPoll.value = {
    title: '',
    endTime: '',
    questions: [
      {
        question: '',
        answers: [{ text: '' }, { text: '' }]
      }
    ]
  }
  showCreateForm.value = true
}

const startEditingPoll = (poll) => {
  editingPoll.value = poll.id

  newPoll.value = {
    title: poll.title,
    endTime: formatDateTimeLocal(poll.endTime),
    questions: poll.questions.map(q => ({
      question: q.question,
      answers: q.answers.map(a => ({ text: a.text }))
    }))
  }

  showCreateForm.value = true
}

const formatDateTimeLocal = (date) => {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const submitPoll = async () => {
  if (!newPoll.value.title || !newPoll.value.endTime ||
      newPoll.value.questions.some(q => !q.question || q.answers.some(a => !a.text))) {
    alert('Please fill out all fields.');
    return;
  }

  try {
    const payload = {
      title: newPoll.value.title,
      endTime: newPoll.value.endTime,
      questions: newPoll.value.questions
    };

    if (editingPoll.value) {
      await axios.put(`${API_URL}/${editingPoll.value}`, payload);
    } else {
      await axios.post(API_URL, payload);
    }

    showCreateForm.value = false;
    editingPoll.value = null;
    await fetchPolls();
  } catch (err) {
    console.error('Failed to submit poll:', err);
    alert('Failed to submit poll.');
  }
};

const cancelCreate = () => {
  showCreateForm.value = false
  editingPoll.value = null
  newPoll.value = {
    title: '',
    endTime: '',
    questions: [
      {
        question: '',
        answers: [{ text: '' }, { text: '' }]
      }
    ]
  }
}

const deletePoll = async () => {
  if (!editingPoll.value) return
  try {
    await axios.delete(`${API_URL}/${editingPoll.value}`)
    cancelCreate()
    await fetchPolls()
  } catch (err) {
    console.error('Failed to delete poll:', err)
  }
}

const endPoll = async (pollId) => {
  const confirmEnd = confirm('Are you sure you want to end this poll early?')
  if (!confirmEnd) return

  try {
    await axios.post(`${API_URL}/${pollId}/end`)
    await fetchPolls()
  } catch (err) {
    console.error('Failed to end poll:', err)
  }
}

const fetchPolls = async () => {
  try {
    const res = await axios.get(API_URL)
    polls.value = res.data.map(p => {
      const end = p.endTime._seconds ? new Date(p.endTime._seconds * 1000)
          : new Date(p.endTime)

      return {
        ...p,
        endTime: end,
        formattedEndTime: isNaN(end) ? 'Invalid Date' : formatFullEndTime(end)
      }
    })
    updateCountdowns()
  } catch (err) {
    console.error('Failed to fetch polls:', err)
  }
}

const updateCountdowns = () => {
  const now = Date.now()
  countdowns.value = {}

  polls.value.forEach(p => {
    if (p.ended) {
      countdowns.value[p.id] = 'Ended'
      return
    }

    const end = p.endTime instanceof Date
        ? p.endTime
        : p.endTime?._seconds
            ? new Date(p.endTime._seconds * 1000)
            : new Date(p.endTime)

    if (!(end instanceof Date) || isNaN(end.getTime())) {
      countdowns.value[p.id] = 'Invalid Date'
      return
    }

    const diff = end.getTime() - now

    countdowns.value[p.id] = diff > 0
        ? `${Math.floor(diff / 86400000)}d ${Math.floor((diff / 3600000) % 24)}h ${Math.floor((diff / 60000) % 60)}m ${Math.floor((diff / 1000) % 60)}s`
        : 'Ended'
  })
}

const formatFullEndTime = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return 'Invalid Date'
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

onMounted(() => {
  fetchPolls()
  setInterval(async () => {
    await fetchPolls()
  }, 30000) // Re-fetch polls every 30s to detect server-side 'ended' status
})
</script>

<style scoped>
.polls-page {
  max-width: 700px;
  margin: auto;
  padding: 2rem;
  color: #eee;
}

.create-form {
  background: #1f1f1f;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  box-sizing: border-box;
  width: 100%;
}

.field {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.field.vertical {
  flex-direction: column;
  align-items: center;
}

label {
  min-width: 120px;
  font-weight: bold;
}

input[type="text"],
input[type="datetime-local"] {
  background: #2c2c2c;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  width: 100%;
  max-width: 500px;
}

.answer-row {
  margin-bottom: 0.5rem;
  width: 100%;
  align-items: center;
}

.add-answer {
  margin-top: 0.5rem;
}

.remove-answer-btn {
  background: none;
  color: #ff6b6b;
  border: none;
  font-size: 1rem;
  margin-left: 0.5rem;
  cursor: pointer;
}

.remove-answer-btn:hover {
  color: #ff4b4b;
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

.poll-list {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.poll-card {
  background: #2a2a2a;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #444;
}

.poll-card h4 {
  margin: 0 0 0.5rem;
}

.countdown {
  margin-bottom: 0.5rem;
  font-style: italic;
  color: #ccc;
}

.card-actions {
  display: flex;
  gap: 1rem;
}

.small-btn {
  padding: 0.4rem 0.8rem;
  background: #444;
  color: #fff;
  border: none;
  border-radius: 5px;
  transition: 0.2s;
}

.small-btn:hover {
  background: #666;
  cursor: pointer;
}
</style>
