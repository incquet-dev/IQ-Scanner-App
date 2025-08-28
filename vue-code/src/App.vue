<template>
  <v-app>
    <v-app-bar
      app
      color="rgb(48, 63, 159)"
      dark
    >
      <div class="d-flex align-center">
        <img src="" alt="">
       <span>IQ - Scanner</span>
      </div>

      <v-spacer></v-spacer>

    </v-app-bar>

    <v-main>
      <ScannerComponent/>
    </v-main>
  </v-app>
</template>

<script>

import ScannerComponent from './components/ScannerComponent.vue';

export default {
  name: 'App',

  components: {
    ScannerComponent,
  },

  data: () => ({
    //
  }),
};
</script>
