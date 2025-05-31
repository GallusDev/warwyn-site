<template>
  <div class="dashboard-wrapper">
    <div class="main-dashboard">
      <h2 class="header">
        <img
            v-if="user_rights === 1"
            :src="pmodCrown"
            alt="PMod"
            class="mod-crown"
        />
        <img
            v-if="user_rights > 1"
            :src="jmodCrown"
            alt="JMod"
            class="mod-crown"
        />
        {{ displayUsername }}
      </h2>

      <div class="info-grid">
        <div class="info-block">
          <strong>Email:</strong>
          <span>{{ showEmail ? maskedEmail : '••••••••••••••' }}</span>
          <!--        <button @click="showEmail = !showEmail">{{ showEmail ? 'Hide' : 'Show' }}</button>-->
        </div>

        <div class="info-block">
          <div class="info-label">
            <img :src="wyncoinIcon" alt="Wyncoins" class="icon"/>
            <strong>Wyncoins:</strong>
          </div>
          <span>{{ wyncoins }}</span>
        </div>

        <div class="info-block">
          <strong>Total Level:</strong> {{ totalLevel.toLocaleString() }}
        </div>
      </div>

      <h3 class="skills-header">Skills</h3>
      <div class="skills-grid">
        <div
            v-for="(skill, index) in playerStats"
            :key="index"
            class="skill-box"
        >
          <div class="border-anim"></div>
          <span class="skill-name">{{ skill.skill }}</span>
          <span class="skill-level">{{ skill.level }}</span>
          <div class="tooltip">XP: {{ (skill.experience ?? 0).toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'

const props = defineProps({
  userData: Object,
  hiscoresData: Object
})

const pmodCrown = 'https://oldschool.runescape.wiki/images/Player_moderator_emblem.png'
const jmodCrown = 'https://oldschool.runescape.wiki/images/Jagex_moderator_emblem.png'
const wyncoinIcon = 'https://cdn-icons-png.flaticon.com/512/8810/8810527.png'

const showEmail = ref(true)

const displayUsername = computed(() =>
    props.userData.username.replace(/\b\w/g, l => l.toUpperCase())
)

const maskedEmail = computed(() => {
  const email = props.hiscoresData.email
  const [user, domain] = email.split('@')
  if (user.length <= 2) return '*@' + domain
  return user[0] + '*'.repeat(user.length - 2) + user.slice(-1) + '@' + domain
})

const wyncoins = computed(() =>
    (props.hiscoresData.wyncoins || 0).toLocaleString()
)
const totalLevel = computed(() => props.hiscoresData.totalLevel)
const user_rights = computed(() => props.hiscoresData.user_rights || 0)
const playerStats = computed(() => props.hiscoresData.playerStats || [])

const skillList = [
  'Overall', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer', 'Magic',
  'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing',
  'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecrafting'
]
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  justify-content: center;
  padding: 0 2rem 2rem;
}

main-dashboard {
  max-width: 960px;
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header {
  font-size: 2rem;
  font-weight: bold;

  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
}

.mod-crown {
  width: 24px;
  height: 24px;
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-between;
}

.info-block {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.6), rgba(50, 50, 50, 0.4));
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex: 1 1 30%;
  min-width: 200px;
  padding: 1.2rem 1.5rem;
  border-radius: 12px;
  box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.05), 0 6px 16px rgba(0, 0, 0, 0.3);
  color: var(--text-light);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon {
  width: 20px;
  height: 20px;
  margin-left: 0.25rem;
  vertical-align: middle;
}

.skills-header {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-light);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 1rem;
}

.skill-box {
  position: relative;
  background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
  border-radius: 10px;
  padding: 0.85rem;
  text-align: center;
  font-size: 0.95rem;
  color: var(--text-light);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 1;
}

.skill-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(255, 255, 255, 0.05);
}

.skill-box .border-anim {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  border: 2px solid var(--accent);
  border-radius: 10px;
  opacity: 0;
  pointer-events: none;
  z-index: 0;
  clip-path: polygon(0 0, 0 0, 0 0, 0 0);
  transition: none;
}

.skill-box:hover .border-anim {
  opacity: 1;
  animation: draw-border 0.6s forwards ease-in-out;
}

@keyframes draw-border {
  0% {
    clip-path: polygon(0 0, 0 0, 0 0, 0 0);
  }
  25% {
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
  }
  50% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 0);
  }
  75% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  100% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}

.tooltip {
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 10;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
}

.skill-box:hover .tooltip {
  opacity: 1;
}

.skill-name {
  display: block;
  font-weight: bold;
  color: var(--accent);
}

.skill-level {
  color: var(--text-light);
}
</style>