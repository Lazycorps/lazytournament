<template>
  <v-app>
    <v-navigation-drawer permanent class="noprint">
      <v-list nav>
        <v-list-item
          prepend-icon="mdi-account-group-outline"
          title="Équipes"
          value="teams"
          to="teams"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-podium"
          title="Classement"
          value="ranking"
          to="ranking"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-sword-cross"
          title="Round"
          value="round"
          to="round"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cog"
          title="Configuration"
          value="configuration"
          to="configuration"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar color="primary" class="noprint" title="LazyTournament">
    </v-app-bar>
    <v-main class="print">
      <div class="pa-5">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts"></script>
<style>
@media print {
  .noprint {
    visibility: hidden !important;
  }

  .print {
    padding: 0 !important;
  }
}
</style>
