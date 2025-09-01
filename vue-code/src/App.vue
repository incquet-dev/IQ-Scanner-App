<template>
  <v-app>
    <v-app-bar app color="rgb(48, 63, 159)" height="50" style="z-index: 10;" dark>
      <div class="d-flex align-center" style="cursor: pointer;" @click="goExternal">
          <span>IQ - Scanner</span>
      </div>


      <v-spacer></v-spacer>

      <label style=" display: flex; align-items: center; gap: 6px;">
        <input v-model="showQuantity" type="checkbox" class="styled-checkbox" disabled />
        <span>Show Quantity</span>
      </label>


    </v-app-bar>

    <v-main>
      <ScannerComponent :showQuantity="showQuantity" :formName="formName" :fieldName="fieldName" />
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
      formName:"",
      fieldName:""
    }
  },
  methods: {
    goExternal() {
      let a = document.createElement("a");
      a.href = "https://incquet.com/?utm_src=iqscanner&utm_medium=alpha"
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    }
  },
  created() {
    ZOHO.CREATOR.UTIL.getQueryParams().then((params) => {
      this.showQuantity = params.showQuantity === "true";
      this.formName= params.formName;
      this.fieldName = params.fieldName;
      console.log(this.showQuantity, this.fieldName, this.formName);
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

.v-data-table > .v-data-table__wrapper > table > tbody > tr > td, .v-data-table > .v-data-table__wrapper > table > tbody > tr > th, .v-data-table > .v-data-table__wrapper > table > thead > tr > td, .v-data-table > .v-data-table__wrapper > table > thead > tr > th, .v-data-table > .v-data-table__wrapper > table > tfoot > tr > td, .v-data-table > .v-data-table__wrapper > table > tfoot > tr > th {
    padding: 0px 10px;
    transition: height 0.2s cubic-bezier(0.4, 0, 0.6, 1);
}
</style>