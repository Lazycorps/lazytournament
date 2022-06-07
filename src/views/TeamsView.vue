<template>
  <v-row>
    <v-col>
      <v-text-field name="team" label="Teams" v-model=name @keydown.enter="addTeam" append-inner-icon="mdi-plus">
      </v-text-field>
    </v-col>
  </v-row>
  <v-row>
    <v-table>
      <thead>
        <tr>
          <th class="text-left" style="width: 100px;">
            Rank
          </th>
          <th class="text-left" style="width: 400px;">
            Name
          </th>
          <th class="text-left" style="width: 200px;">
            Match
          </th>
          <th class="text-left" style="width: 100px;">
            Score
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tournamentStore.teams" :key="item.name">
          <td>{{ index + 1 }}</td>
          <td>{{ item.name }}</td>
          <td>W-L-W-W-W</td>
          <td>1600</td>
          <td>
            <v-btn variant="outlined" icon size="x-small" color="red" @click="deleteTeam(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn></td>
        </tr>
      </tbody>
    </v-table>
  </v-row>
</template>

<script setup lang="ts">
import type Team from '@/models/team';
import { useTournamentStore } from '@/stores/tournament';
import { ref } from 'vue';

const tournamentStore = useTournamentStore();
const name = ref();

function addTeam() {
  tournamentStore.addTeam(name.value);
  name.value = "";
}

function deleteTeam(team: Team){
  tournamentStore.deleteTeam(team);
}
</script>

