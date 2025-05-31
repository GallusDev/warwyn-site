<template>
  <div class="container">
    <div class="hiscores-wrapper">
      <!-- Desktop sidebar -->
      <aside v-if="!selectedPlayer" class="sidebar desktop-only">
        <ul>
          <li
              v-for="skill in skillList"
              :key="skill"
              :class="{ active: selectedSkill === skill }"
              @click="selectedSkill = skill"
          >
            {{ skill }}
          </li>
        </ul>
      </aside>

      <!-- Mobile dropdown -->
      <div v-if="!selectedPlayer" class="mobile-only" style="width: 100%; margin-bottom: 1rem;">
        <select v-model="selectedSkill" class="skill-dropdown">
          <option v-for="skill in skillList" :key="skill" :value="skill">{{ skill }}</option>
        </select>
      </div>

      <div class="hiscores-table">
        <h4 v-if="selectedPlayer" @click="backToList" class="back-link"><font-awesome-icon :icon="['fas', 'chevron-left']" /> Back to Hiscores</h4>
        <h2 v-if="!selectedPlayer">{{ selectedSkill }} Hiscores</h2>
        <h2 v-else>{{ selectedPlayer.username }}'s Stats</h2>

        <table v-if="!selectedPlayer">
          <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Level</th>
            <th>Experience</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="player in displayedScores" :key="player.name">
            <td>{{ player.rank }}</td>
            <td @click="showPlayer(player.name)" class="clickable-name">
              <img
                  v-if="player.user_rights === 1"
                  src="https://oldschool.runescape.wiki/images/Player_moderator_emblem.png"
                  alt="P Mod"
                  width="16"
                  height="16"
                  style="margin-right: 4px; vertical-align: middle;"
              />
              {{ player.name }}
            </td>
            <td>{{ player.level }}</td>
            <td>{{ player.experience.toLocaleString() }}</td>
          </tr>
          </tbody>
        </table>

        <div v-else class="player-details">
          <p class="player-summary">
            Overall Rank: {{ getOverallRank(selectedPlayer.username) }} |
            Total Level: {{ typeof selectedPlayer.totalLevel === 'number' ? selectedPlayer.totalLevel : 'N/A' }} |
            Total XP: {{
              typeof selectedPlayer.totalExp === 'number' ? selectedPlayer.totalExp.toLocaleString() : 'N/A'
            }}
          </p>

<!--          <button @click="backToList">Back to Hiscores</button>-->

          <table>
            <thead>
            <tr>
              <th>Skill</th>
              <th>Rank</th>
              <th>Level</th>
              <th>Experience</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="stat in selectedPlayer.playerStats" :key="stat.skill">
              <td>{{ stat.skill }}</td>
              <td>{{ getSkillRank(stat.skill, selectedPlayer.username) }}</td>
              <td>{{ stat.level ?? 1 }}</td>
              <td>{{ typeof stat.experience === 'number' ? stat.experience.toLocaleString() : '0' }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const selectedPlayer = ref(null);
const selectedSkill = ref('Overall')

const hiscores = ref([])

const skillList = [
  'Overall', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer', 'Magic',
  'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing',
  'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecrafting'
]

const fetchHiscores = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/hiscores');
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Expected hiscores to be an array, got:", data);
      return;
    }

    console.log(data);

    hiscores.value = data;
  } catch (err) {
    console.error("Failed to fetch hiscores:", err);
  }
};

onMounted(fetchHiscores)

const displayedScores = computed(() => {
  if (selectedSkill.value === 'Overall') {
    return hiscores.value.map((p, index) => ({
      rank: index + 1,
      name: p.username,
      level: p.totalLevel,
      experience: p.totalExp,
      user_rights: p.user_rights
    }));
  } else {
    const sorted = [...hiscores.value].sort((a, b) => {
      const aStat = pStat(a, selectedSkill.value);
      const bStat = pStat(b, selectedSkill.value);
      return (bStat?.experience || 0) - (aStat?.experience || 0);
    });

    return sorted.map((p, index) => {
      const stat = pStat(p, selectedSkill.value);
      return {
        rank: index + 1,
        name: p.username,
        level: stat?.level || 0,
        experience: stat?.experience || 0,
        user_rights: p.user_rights
      };
    });
  }
});

// helper function
function pStat(player, skillName) {
  return player.playerStats?.find(s => s.skill === skillName)
}

function showPlayer(username) {
  selectedPlayer.value = hiscores.value.find(p => p.username === username) || null
}

function getOverallRank(username) {
  const ranked = [...hiscores.value].sort((a, b) =>
      b.level - a.level || b.experience - a.experience
  );
  return ranked.findIndex(p => p.username === username) + 1;
}

function getSkillRank(skill, username) {
  if (skill === 'Overall') return getOverallRank(username);

  const ranked = [...hiscores.value]
      .map(p => {
        const stat = p.playerStats?.find(s => s.skill === skill);
        return {
          username: p.username,
          experience: stat?.experience ?? 0
        };
      })
      .sort((a, b) => b.experience - a.experience);

  return ranked.findIndex(p => p.username === username) + 1;
}

function backToList() {
  selectedPlayer.value = null;
}
</script>

<style scoped>
.hiscores-wrapper {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  width: 100%;
}

.sidebar {
  width: 200px;
  background-color: var(--bg-dark);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  color: var(--text-light);
}

.sidebar li:hover {
  background-color: var(--bg-hover);
}

.sidebar li.active {
  background-color: var(--accent);
  color: var(--on-accent);
}

.hiscores-table {
  flex: 1;
  min-width: 300px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th {
  background-color: #1f1f1f;
  padding: 0.75rem;
  color: var(--text-light);
  text-align: left;
}

td {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-light);
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

.clickable-name {
  color: var(--accent);
  cursor: pointer;
}

.clickable-name:hover {
  text-decoration: underline;
}

.player-details {
  margin-top: 1rem;
}

.player-summary {
  margin-bottom: 1rem;
  font-weight: bold;
  color: var(--text-light);
}

.player-details table {
  width: 100%;
  border-collapse: collapse;
}

.player-details th {
  background-color: #2e2e2e;
  padding: 0.75rem;
  color: var(--text-light);
  text-align: left;
}

.player-details td {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-light);
}

.back-button {
  margin-top: 1rem;
  background-color: var(--accent);
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Show/hide logic for responsive sidebar */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .sidebar {
    width: 100%;
    padding: 0;
    border: none;
    background: transparent;
  }
}

.skill-dropdown {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.8), rgba(50, 50, 50, 0.6));
  color: var(--text-light);
  border: 1px solid var(--border-color);
  font-size: 1rem;
  font-family: inherit;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg fill='%23ccc' viewBox='0 0 24 24' width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
}

.skill-dropdown:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

/* Target option elements (Firefox only) */
.skill-dropdown option {
  background-color: var(--bg-dark);
  color: var(--text-light);
}

/* Attempt to highlight the selected option (Firefox only) */
.skill-dropdown option:checked {
  background-color: var(--accent);
  color: var(--on-accent, #000);
}
</style>