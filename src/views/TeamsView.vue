<template>
  <v-row>
    <v-col>
      <v-text-field
        name="team"
        label="Teams"
        v-model="name"
        @keydown.enter="addTeam"
        append-inner-icon="mdi-plus"
      >
      </v-text-field>
    </v-col>
  </v-row>
  <v-row class="d-flex justify-start">
    
  </v-row>
  <v-row>
    <v-table>
      <thead>
        <tr>
          <th class="text-left" style="width: 100px">Numéro</th>
          <th class="text-left" style="width: 80">Présent</th>
          <th class="text-left" style="width: 80">boule</th>
          <th class="text-left" style="width: 300px">Nom</th>
          <th class="text-left" style="width: 400px">Responsable</th>
          <th class="text-left" style="width: 300px">Staff</th>
          <th class="text-left" style="width: 100px">Score</th>
          <th class="text-left" style="width: 150px">
            <v-checkbox v-model="edition" hide-details>Supprimer</v-checkbox>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tournamentStore.teams" :key="item.name">
          <td>{{ index + 1 }}</td>
          <td>
            <v-checkbox v-model="item.isReady" hide-details></v-checkbox>
          </td>
          <td>
            <v-checkbox v-model="item.boule" hide-details></v-checkbox>
          </td>
          <td>{{ item.name }}</td>
          <td>
            <v-text-field
              class="mr-3"
              single-line
              hide-details
              density="compact"
              v-model="item.membre"
            ></v-text-field>
          </td>
          <td>
            <div class="d-flex justify-start align-center">
              <v-checkbox v-model="item.isStaff" hide-details></v-checkbox>
              <v-text-field
                v-if="item.isStaff"
                class="mr-3"
                single-line
                hide-details
                density="compact"
                label="Staff info"
                style="width: 300px"
                v-model="item.staffInfo"
              ></v-text-field>
            </div>
          </td>
          <td>{{ item.score }}</td>
          <td>
            <v-btn
              v-if="edition"
              variant="outlined"
              icon
              size="x-small"
              color="red"
              @click="deleteTeam(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-row>
</template>

<script setup lang="ts">
import type Team from "@/models/team";
import { useTournamentStore } from "@/stores/tournament";
import { ref } from "vue";

const tournamentStore = useTournamentStore();
const name = ref();
const edition = ref(false);

function addTeam() {
  tournamentStore.addTeam(name.value);
  name.value = "";
}

function deleteTeam(team: Team) {
  tournamentStore.deleteTeam(team);
}
</script>
