<template>
  <v-app>
    <v-navigation-drawer permanent>
      <v-list nav>
        <v-list-item prepend-icon="mdi-account-group-outline" title="Teams" value="teams" to="teams"></v-list-item>
        <v-list-item prepend-icon="mdi-podium" title="Ranking" value="ranking" to="ranking"></v-list-item>
        <v-list-item prepend-icon="mdi-sword-cross" title="Round" value="round" to="round"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Configuration" value="configuration" to="configuration"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar color="primary">
      LazyTournament
    </v-app-bar>
    <v-main>
      <div class="pa-5">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts"></script>
