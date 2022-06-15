<template>
  <v-row> 
    <v-btn outline color="primary" @click="tournamentStore.recalculScore" dark>Recalcul</v-btn>
  </v-row>
  <v-row>
    <v-table>
      <thead>
        <tr>
          <th class="text-left" style="width: 100px">Rank</th>
          <th class="text-left" style="width: 400px">Name</th>
          <th class="text-left" style="width: 200px">Match</th>
          <th class="text-left" style="width: 100px">Score</th>
          <th class="text-left" style="width: 100px">Points marqués</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(team, index) in tournamentStore.getTeamsByScore"
          :key="team.name"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ team.name }}</td>
          <td class="d-flex flex-row">
            <template
              v-for="(match, i) in tournamentStore.getTeamMatches(team.name)"
              :key="match.name"
            >
              <div
                v-if="match.winner == team.name"
                class="mr-3"
                style="color: green; font-weight: bold"
              >
                W
              </div>
              <div
                v-else-if="match.winner == 'Null'"
                class="mr-3"
                style="font-weight: bold"
              >
                N
              </div>
              <div
                v-else="match.winner != team.name"
                class="mr-3"
                style="color: red; font-weight: bold"
              >
                D
              </div>
            </template>
          </td>
          <td>{{ team.score }}</td>
          <td>{{ team.pointMarque }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-row>
</template>

<script setup lang="ts">
import { useTournamentStore } from "@/stores/tournament";
import { ref } from "vue";

const tournamentStore = useTournamentStore();
</script>
