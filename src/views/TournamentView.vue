<template>
    <v-row>
        <v-col>
            <v-text-field name="fields" label="fields" v-model="fields" @change="fieldChange"></v-text-field>
        </v-col>
    </v-row>
    <v-row>
        <v-col>
            <v-text-field name="rounds" label="rounds" v-model="rounds" @change="roundsChange"></v-text-field>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { useTournamentStore } from '@/stores/tournament';
import { onMounted, ref } from 'vue';

const tournamentStore = useTournamentStore();
const fields = ref();
const rounds = ref();

onMounted(() => {
    fields.value = tournamentStore.fields;
    rounds.value = tournamentStore.rounds;
})

function fieldChange() {
    tournamentStore.setFields(fields.value);
}

function roundsChange() {
    tournamentStore.setRounds(rounds.value);
}
</script>


