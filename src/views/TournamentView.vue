<template>
  <v-row>
    <v-col>
      <v-text-field
        name="fields"
        label="fields"
        v-model="tournamentStore.fields"
      ></v-text-field>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <v-text-field
        name="rounds"
        label="rounds"
        v-model="tournamentStore.rounds"
      ></v-text-field>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <v-btn @click="tournamentStore.resetAllRound()" color="red"
        >Reset all round</v-btn
      >
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useTournamentStore } from "@/stores/tournament";
const tournamentStore = useTournamentStore();
</script>
