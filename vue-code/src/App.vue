<template>
  <v-app>
    <v-app-bar app color="rgb(48, 63, 159)" dark>
      <div class="d-flex align-center">
        <img src="" alt="">
        <span>IQ - Scanner</span>
      </div>


      <v-spacer></v-spacer>

      <label style=" display: flex; align-items: center; gap: 6px;">
        <input v-model="showQuantity" type="checkbox" class="styled-checkbox" disabled />
        <span>Show Quantity</span>
      </label>


    </v-app-bar>

    <v-main>
      <ScannerComponent :showQuantity="showQuantity" />
    </v-main>
  </v-app>
</template>

<script>


import { ZOHO } from '../lib/widgets.js'; 
import ScannerComponent from './components/ScannerComponent.vue';

export default {
  name: 'App',

  components: {
    ScannerComponent,
  },

  data() {
    return {
      showQuantity: false,
    }
  },
  created() {
    ZOHO.CREATOR.UTIL.getQueryParams().then((params) => {
      this.showQuantity = params.showQuantity === "true";
    })
  }
};
</script>

<style>
.styled-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #4CAF50;
}
</style>