<template>
  <div class="container">
    <div class="card">
      <h2>Create a Skill Contract</h2>
      <form @submit.prevent="submitContract">
        <label for="contract_name">Contract Name</label>
        <input id="contract_name" v-model="contract.contractName" required />

        <label for="contract_type">Contract Type</label>
        <select id="contract_type" v-model="contract.contractType" required>
          <option disabled value="">Please select</option>
          <option>Gather</option>
          <option>Delivery</option>
        </select>

        <label for="contract_skill">Contract Skill</label>
        <select id="contract_skill" v-model="contract.contractSkill" @change="updateNpcOptions" required>
          <option disabled value="">Please select</option>
          <option v-for="skill in availableSkills" :key="skill">{{ skill }}</option>
        </select>

        <label for="level_requirement">Required Level</label>
        <input id="level_requirement" v-model.number="contract.levelRequirement" type="number" min="1" max="99" required />

        <label for="turn_in_npc">Turn-in NPC</label>
        <select id="turn_in_npc" v-model.number="contract.turnInNpc" required>
          <option disabled value="">Please select</option>
          <option v-for="npc in availableNpcs" :key="npc.id" :value="npc.id">{{ npc.name }}</option>
        </select>

        <label for="contract_item">Item ID</label>
        <input id="contract_item" v-model.number="contract.contractItem" type="number" min="1" required />

        <label for="amounts">Amount Min/Max (comma-separated)</label>
        <input id="amounts" v-model="amounts" placeholder="e.g. 100, 250, 500" required />

        <label for="contract_weight">Contract Weight</label>
        <input id="contract_weight" v-model.number="contract.contractWeight" type="number" min="1" required />

        <label for="contract_text">Contract Description</label>
        <br />
        <textarea
            id="contract_text"
            v-model="contract.contractText"
            style="min-height: 120px; min-width: 300px;"
        ></textarea>
        <br />
        <button type="submit">Submit Contract</button>
        <!-- <button type="button" @click="downloadContract">Download Contract</button> -->
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContractCreator',
  data() {
    return {
      contract: {
        contractName: '',
        contractType: '',
        contractSkill: '',
        levelRequirement: 1,
        turnInNpc: '',
        contractItem: 1,
        contractWeight: 1,
        contractMin: 0,
        contractMax: 0,
        contractText: '',
      },
      amounts: '',
      availableSkills: [
        'Woodcutting', 'Mining', 'Smithing', 'Fishing', 'Fletching',
        'Crafting', 'Runecrafting', 'Herblore'
      ],
      npcData: {
        Woodcutting: [ { id: 519, name: 'Bob' }, { id: 2998, name: 'Wilfred' } ],
        Mining: [ { id: 519, name: 'Bob' }, { id: 549, name: 'Horvik' }, { id: 747, name: 'Oziach' } ],
        Smithing: [ { id: 577, name: 'Cassie' }, { id: 606, name: 'Squire' }, { id: 747, name: 'Oziach' }, { id: 549, name: 'Horvik' } ],
        Fishing: [ { id: 918, name: 'Ned' }, { id: 607, name: 'Gunnjorn' }, { id: 780, name: 'Gertrude' } ],
        Fletching: [ { id: 550, name: 'Lowe' }, { id: 575, name: 'Hickton' } ],
        Crafting: [ { id: 758, name: 'Fred the Farmer' }, { id: 918, name: 'Ned' }, { id: 2304, name: 'Sarah' }, { id: 580, name: 'Flynn' }, { id: 546, name: 'Zaff' }, { id: 548, name: 'Thessalia' } ],
        Runecrafting: [ { id: 546, name: 'Zaff' }, { id: 553, name: 'Aubury' } ],
        Herblore: [ { id: 638, name: 'Apothecary' }, { id: 587, name: 'Jatix' }, { id: 455, name: 'Kaqemeex' } ]
      },
      availableNpcs: []
    };
  },
  methods: {
    updateNpcOptions() {
      this.availableNpcs = this.npcData[this.contract.contractSkill] || [];
      this.contract.turnInNpc = '';
    },
    async submitContract() {
      const [min, max] = this.amounts
          .split(',')
          .map(a => parseInt(a.trim(), 10))
          .filter(n => !isNaN(n));

      this.contract.contractMin = min || 0;
      this.contract.contractMax = max || 0;

      try {
        // Step 1: Generate the Protobuf binary (.legacy file)
        const response = await fetch('http://localhost:3000/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.contract)
        });

        if (!response.ok) throw new Error('Failed to generate contract');

        const blob = await response.blob();

        // Step 2: Upload the blob to the game-server
        const formData = new FormData();
        formData.append('file', blob, `${this.contract.contractName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.legacy`);

        const uploadRes = await fetch('http://localhost:4567/upload-contract', {
          method: 'POST',
          body: formData
        });

        if (!uploadRes.ok) throw new Error('Failed to upload contract');
        alert('Contract successfully uploaded to the game server!');

        // Reset Fields
        this.contract = {
          contractName: '',
          contractType: '',
          contractSkill: '',
          levelRequirement: 1,
          turnInNpc: '',
          contractItem: 1,
          contractWeight: 1,
          contractMin: 0,
          contractMax: 0,
          contractText: ''
        };
        this.amounts = '';
        this.availableNpcs = [];

      } catch (err) {
        alert('Error: ' + err.message);
      }
    },

    async downloadContract() {
      const [min, max] = this.amounts
          .split(',')
          .map(a => parseInt(a.trim(), 10))
          .filter(n => !isNaN(n));

      this.contract.contractMin = min || 0;
      this.contract.contractMax = max || 0;

      try {
        const response = await fetch('http://localhost:3000/api/contracts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.contract)
        });

        if (!response.ok) throw new Error('Failed to download contract');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.contract.contractName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.legacy`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Reset Fields
        this.contract = {
          contractName: '',
          contractType: '',
          contractSkill: '',
          levelRequirement: 1,
          turnInNpc: '',
          contractItem: 1,
          contractWeight: 1,
          contractMin: 0,
          contractMax: 0,
          contractText: ''
        };
        this.amounts = '';
        this.availableNpcs = [];

      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  }
};
</script>

<style scoped>
.card h2 {
  margin-top: 0;
  color: var(--accent);
}
</style>