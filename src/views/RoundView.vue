<template>
    <v-row class="pa-3">
        <v-col>
            <v-btn v-for="n in tournamentStore.rounds" :color="roundDisplay == n ? 'primary' : 'grey'" class="mr-2" @click="roundDisplay = n">Manche {{ n }}</v-btn>
        </v-col>
    </v-row>
    <v-row class="pl-3">
        <v-col>
            <v-btn color="success" @click="tournamentStore.generateRound(roundDisplay)">Générer manche {{ roundDisplay }}</v-btn>
        </v-col>
    </v-row>
    <v-row>
        <v-table>
            <thead>
                <tr>
                    <th class="text-left" style="width: 100px;">
                        Terrain
                    </th>
                    <th class="text-left" style="width: 250px;">
                        Equipe 1
                    </th>
                    <th class="text-left" style="width: 250px;">
                        Equipe 2
                    </th>
                    <th class="text-left" style="width: 300px;">
                        Résultat
                    </th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in tournamentStore.getByRound(roundDisplay)" :key="item.team1">
                    <tr v-if="item.field == 1">
                        <td colspan="5" style="background-color:goldenrod"></td>
                    </tr>
                    <tr>
                        <td>{{ item.field }}</td>
                        <td :style="getColor(item, item.team1)">{{ item.team1 }}{{ tournamentStore.getTeamStaffInfo(item.team1) }} - <b>{{ tournamentStore.getTeamScore(item.team1) }}</b></td>
                        <td :style="getColor(item, item.team2)">{{ item.team2 }}{{ tournamentStore.getTeamStaffInfo(item.team2) }} - <b>{{ tournamentStore.getTeamScore(item.team2) }}</b></td>
                        <td class="d-flex justify-start align-center">
                            <v-text-field class="mr-3" single-line hide-details density="compact" label="Equ.1"
                                v-model="item.scoreTeam1" :readonly="item.winner != ''" type="number"></v-text-field>
                            <v-text-field single-line hide-details density="compact" label="Equ.2" v-model="item.scoreTeam2"
                                :readonly="item.winner != ''" type="number">
                            </v-text-field>
                        </td>
                        <td>
                            <v-btn v-if="item.winner == ''" color="success" @click="setWinner(item)">Terminer</v-btn>
                            <v-icon v-else icon="mdi-check" color="success"></v-icon>
                        </td>
                    </tr>
                </template>
            </tbody>
        </v-table>
    </v-row>
</template>

<script setup lang="ts">
import type Match from '@/models/match';
import { useTournamentStore } from '@/stores/tournament';
import { onMounted, ref } from 'vue';

const tournamentStore = useTournamentStore();
const roundDisplay = ref(1);

onMounted(() => {
})

function setWinner(match: Match) {
    tournamentStore.setMatchWinner(match);
}

function getColor(match: Match, team: string) {
    if (match.winner == '' || match.winner == 'Null') return 'color: black';
    else if (match.winner == team) return 'color: green; font-weight: bold';
    else return 'color: red';
}
</script>


