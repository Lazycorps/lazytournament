<template>
  <v-app>
    <v-navigation-drawer permanent>
      <v-list nav>
        <v-list-item
          prepend-icon="mdi-account-group-outline"
          title="Teams"
          value="teams"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-podium"
          title="Ranking"
          value="ranking"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-sword-cross"
          title="Round"
          value="round"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar color="primary"></v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts"></script>
