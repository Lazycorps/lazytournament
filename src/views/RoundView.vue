<template>
  <v-row class="pa-3">
    <v-col>
      <v-btn
        v-for="n in tournamentStore.rounds"
        :color="roundDisplay == n ? 'primary' : 'grey'"
        class="mr-2"
        @click="roundDisplay = n"
        >Manche {{ n }}</v-btn
      >
    </v-col>
  </v-row>
  <v-row class="pl-3">
    <v-col>
      <v-btn
        color="success"
        class="mr-3"
        @click="tournamentStore.generateRound(roundDisplay, 0)"
        :disabled="tournamentStore.cantGenerateManche(roundDisplay)"
        >Générer manche {{ roundDisplay }}</v-btn
      >
      <v-btn
        v-for="phase in tournamentStore.split"
        color="warning"
        class="mr-3"
        @click="tournamentStore.generateRound(roundDisplay, phase)"
        :disabled="tournamentStore.cantGeneratePhase(roundDisplay, phase)"
        >Générer phase {{ phase }}</v-btn
      >
      <v-btn
        color="blue"
        class="ml-5"
        @click="printDialog = true"
        append-icon="mdi-printer"
        >Imprimer</v-btn
      >
    </v-col>
  </v-row>
  <v-row>
    <v-table>
      <thead>
        <tr>
          <th class="text-left" style="width: 100px">Terrain</th>
          <th class="text-left" style="width: 250px">Equipe 1</th>
          <th class="text-left" style="width: 250px">Equipe 2</th>
          <th class="text-left" style="width: 300px">Résultat</th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="(item, index) in tournamentStore.getByRound(roundDisplay)"
          :key="item.team1"
        >
          <tr v-if="item.field == 1">
            <td colspan="5" class="" style="background-color: lightgray">
              Phase {{ Math.abs(index / tournamentStore.fields + 1) }}
            </td>
          </tr>
          <tr>
            <td>{{ item.field }}</td>
            <td :style="getColor(item, item.team1?.name)">
              {{ item.team1?.name
              }}<b v-if="item.team1?.isStaff" class="ml-2">({{ item.team1?.staffInfo }})</b> -
              {{ item.team1?.score }}
            </td>
            <td v-if="item.team2" :style="getColor(item, item.team2?.name)">
              {{ item.team2?.name
              }}<b v-if="item.team2?.isStaff" class="ml-2">{{ tournamentStore.getTeamStaffInfo(item.team2?.name) }}</b> -
              {{ item.team2?.score}}
            </td>
            <td v-else></td>
            <td class="d-flex justify-start align-center">
              <v-text-field
                class="mr-3"
                single-line
                hide-details
                density="compact"
                label="Equ.1"
                v-model="item.scoreTeam1"
                :readonly="item.winner != ''"
                type="number"
              ></v-text-field>
              <v-text-field
                single-line
                hide-details
                density="compact"
                label="Equ.2"
                v-model="item.scoreTeam2"
                :readonly="item.winner != ''"
                type="number"
              >
              </v-text-field>
            </td>
            <td>
              <v-btn
                v-if="item.winner == ''"
                color="success"
                @click="setWinner(item)"
                >Terminer</v-btn
              >
              <span v-else>
                <v-icon icon="mdi-check" color="success"></v-icon>
                <v-btn
                  variant="plain"
                  size="mini"
                  icon
                  color="info"
                  class="ml-5"
                  @click="item.winner = ''"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </span>
            </td>
          </tr>
        </template>
      </tbody>
    </v-table>
  </v-row>
  <v-dialog
    v-model="printDialog"
    scrollable
    fullscreen
    transition="dialog-transition"
  >
    <v-card>
      <v-card-title class="d-flex justify-end">
        <v-btn round color="primary" class="mr-5 noprint" prepend-icon="mdi-printer" dark @click="print();"
          >Print</v-btn
        >
        <v-btn round color="primary" class="noprint" dark prepend-icon="mdi-close" @click="printDialog = false"
          >Fermer</v-btn
        >
      </v-card-title>

      <table class="styled-table">
        <thead>
          <tr>
            <th class="text-left" style="width: 100px">Terrain</th>
            <th class="text-left" style="width: 250px">Equipe 1</th>
            <th class="text-left" style="width: 250px">Equipe 2</th>
            <th class="text-left" style="width: 300px">Résultat</th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="(item, index) in tournamentStore.getByRound(roundDisplay)"
            :key="item.team1"
          >
            <tr v-if="item.field == 1">
              <td colspan="5" class="" style="background-color: lightgray">
                Phase {{ Math.abs(index / tournamentStore.fields + 1) }}
              </td>
            </tr>
            <tr>
              <td>{{ item.field }}</td>
              <td>{{ item.team1?.name }}</td>
              <td>{{ item.team2?.name }}</td>
              <td>
                {{
                  item.winner ? item.scoreTeam1 + " - " + item.scoreTeam2 : ""
                }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type Match from "@/models/match";
import { useTournamentStore } from "@/stores/tournament";
import { onMounted, ref } from "vue";

const tournamentStore = useTournamentStore();
const roundDisplay = ref(1);
const printDialog = ref(false);

onMounted(() => {});

function setWinner(match: Match) {
  tournamentStore.setMatchWinner(match);
}

function getColor(match: Match, team: string | null | undefined) {
  if (match.winner == "" || match.winner == "Null") return "color: black";
  else if (match.winner == team) return "color: green; font-weight: bold";
  else return "color: red";
}

function print() {
  window.print();
}
</script>

<style scoped>
.styled-table {
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  font-family: sans-serif;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}

.styled-table thead tr {
  background-color: #009879;
  color: #ffffff;
  text-align: left;
}

.styled-table th,
.styled-table td {
  padding: 12px 15px;
}

.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #009879;
}
</style>
