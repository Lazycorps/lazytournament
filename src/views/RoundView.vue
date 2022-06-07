<template>
    <v-row class="pa-3">
        <v-col>
            <v-btn v-for="n in tournamentStore.rounds" color="primary" class="mr-2" @click="roundDisplay = n">Manche {{ n }}</v-btn>
        </v-col>
    </v-row>
    <v-row class="pl-3">
        <v-col>
            <v-btn color="success" @click="tournamentStore.generateRound(roundDisplay)">Generate</v-btn>
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
                <tr v-for="(item, index) in tournamentStore.getByRound(roundDisplay)" :key="item.team1">
                    <td>{{ item.field }}</td>
                    <td :style="getColor(item, item.team1)">{{ item.team1 }}</td>
                    <td :style="getColor(item, item.team2)">{{ item.team2 }}</td>
                    <td class="d-flex justify-start align-center">
                        <v-text-field class="mr-3" single-line hide-details density="compact" label="Equ.1"
                            v-model="item.scoreTeam1" :readonly="item.winner != ''"></v-text-field>
                        <v-text-field single-line hide-details density="compact" label="Equ.2" v-model="item.scoreTeam2"
                            :readonly="item.winner != ''">
                        </v-text-field>
                    </td>
                    <td>
                        <v-btn v-if="item.winner == ''" color="success" @click="setWinner(item)">Terminer</v-btn>
                        <v-icon v-else icon="mdi-check" color="success"></v-icon>
                    </td>
                </tr>
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
    if (match.scoreTeam1 == match.scoreTeam2)
        match.winner = "Null";
    else if (match.scoreTeam1 > match.scoreTeam2)
        match.winner = match.team1;
    else match.winner = match.team2;
}

function getColor(match: Match, team: string) {
    if (match.winner == '' || match.winner == 'Null') return 'color: black';
    else if (match.winner == team) return 'color: green; font-weight: bold';
    else return 'color: red';
}
</script>


