<template>
  <!--<div class=" justify-center align-center">
        <h3>{{ result || 'scan now' }} <v-btn text v-if="result" @click="result=null">clear</v-btn></h3>-->
  <!-- <QrStream @decode="onDecode"></QrStream> -->


  <!-- <QrcodeStream   @detect="onDecode" >
          <div style="color: red;" class="frame"></div>
        </QrcodeStream> -->
  <!-- <StreamQrcodeBarcodeReader @result="onDecode"/> -->
  <!-- <div ref="scanner" id="scanner" style="width: 100%; border:2px solid black;height: 100px;margin-bottom: 20px;"></div> -->

  <!-- <div v-show="showScanConfirmation" class="scan-confirmation text-center mt-16">
               <img :src="$withBase('/checkmark.svg')" alt="Checkmark" width="128px" />
              <v-btn color="success" fab x-large>
                <v-icon  color="white" x-large class="scanned">mdi-check</v-icon>
              </v-btn> -->

  <!--  </div>-->
  <div>
    <v-container fluid class="d-flex flex-column align-center">
      <v-card max-width="600" max-height="400" class="video-container">
        <video ref="video" class="video" autoplay playsinline webkit-playsinline muted></video>
        <div class="overlay-frame">
          <svg class="scan-frame" viewBox="0 0 512 512">
            <path
              d="M336 448h56a56 56 0 0056-56v-56M448 176v-56a56 56 0 00-56-56h-56M176 448h-56a56 56 0 01-56-56v-56M64 176v-56a56 56 0 0156-56h56"
              fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="10" stroke="white"></path>
          </svg>
        </div>
        <v-row justify="center" class="zoom-controls">
          <v-icon color="gray" @click="zoomIn">mdi-magnify-plus-outline</v-icon>
          <v-icon color="gray" @click="zoomOut">mdi-magnify-minus-outline</v-icon>
        </v-row>
        <v-overlay v-if="overlay" absolute width="100%" height="100%" close-delay="0"
          class="full-overlay align-center justify-center" @click="overlay = false; detectBarcode();">
          <div class="overlayContent  d-flex justify-center align-center flex-column">
            <div>
              <v-icon size="50" class="mb-2">mdi-barcode-scan</v-icon>
            </div>
            <div class="overlay-text">
              <span>Click to scan another Barcode or Qrcode </span>
            </div>
          </div>
        </v-overlay>
      </v-card>
    </v-container>

    <v-row class="d-flex align-items justify-space-between px-2" v-if="scannedItems.length > 0">
      <v-col class="last-item elipsis" cols="10">
        <b style="font-size: 16px;">Last Scanned</b>:  <span class="last-code">{{ lastScannedCode }}</span>
      </v-col>

      <v-col class="d-flex align-items-center gap-1" cols="2">
        <v-icon size="16">mdi-magnify-expand</v-icon>
        <span>{{ scannedItems.length }}</span>
      </v-col>
    </v-row>

    <div v-if="scannedItems.length > 0" class="scanned-table-container mb-5">
      <v-simple-table fixed-header height="60vh" class="scanned-table" width="100%">
        <thead class="table-header">
          <tr>
            <th class="text-center" width="10%">#</th>
            <th class="text-center" width="45%">Scanned Code</th>
            <th class="text-center" width="45%" v-if="showQuantity">Qty</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="(item, index) in scannedItems" :key="item.id">
            <td class="text-left">{{ index + 1 }}</td>
            <td class="text-left elipsis">{{ item.code }}</td>
            <td v-if="showQuantity" class="quantity-cell"> 
              <div class="d-flex align-center justify-center qty-wrapper">
                <v-btn icon @click="item.quantity >= 1 && item.quantity--"> <v-icon>mdi-minus</v-icon></v-btn>
                <span class="qty-value">{{ item.quantity }}</span>
                <v-btn icon  @click="item.quantity++"><v-icon>mdi-plus</v-icon></v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-simple-table>

    </div>
    <div v-else class="d-flex align-center justify-center" style="height: 205px;">
          No Items Scanned
    </div>

    <v-btn 
      class="submit-btn" 
      color="rgb(48, 63, 159)" 
       style="color: white;"
      block 
      :disabled="scannedItems.length === 0"
      @click="handleSubmitData">
      Submit
    </v-btn>


  </div>
</template>

<script>
import { BarcodeDetector } from 'barcode-detector';
import { ZOHO } from '../../lib/widgets.js';


export default {
  props:["showQuantity", "formName", "fieldName"],
  data() {
    return {
      audio : new Audio(require('../assets/beep.mp3')),
      result: null,
      videoStream: null,
      liveStreamStart: false,
      scanning: false,
      zoomLevel: 1,
      overlay: true,
      scannedItems: [],
      lastScannedCode:null,
      ownerName: "",
      appName: ""
    }
  },
  components: {
    // QrStream,
    //QrcodeStream  
  },
  methods: {
    onDecode(content){
        this.$emit('scanned',content);
        if(content != ''){
          this.audio.play().catch(error => {
            console.error('Error playing audio:', error);
          });
        }
    },
    async startScanner() {
      if (!('BarcodeDetector' in window)) {
        console.error('Barcode Detector is not supported by this browser');
        return;
      }
      try {
        this.videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          }
        })

        this.$refs.video.srcObject = this.videoStream;
        this.liveStreamStart = true;
        this.$refs.video.play();
        this.scanning = true;
        console.log("this is overlay", this.overlay);
        if (!this.overlay) this.detectBarcode();
      } catch (error) {
        console.error('Error accessing the camera: ', error);
      }
    },
    async detectBarcode() {
      if (!this.scanning) return;
      const barcodeDetector = new BarcodeDetector({
        formats: [
          'code_128', 'ean_13', 'qr_code', 'aztec', 'codabar', 'code_39',
          'data_matrix', 'databar', 'databar_expanded', 'ean_8', 'itf',
          'upc_e', 'upc_a', 'rm_qr_code'
        ]
      });

      try {
        if (this.$refs.video) {
          const barcodes = await barcodeDetector.detect(this.$refs.video);
          if (barcodes.length > 0) {
            this.overlay = true;
            this.onDecode(barcodes[0].rawValue);
            this.addScannedItem(barcodes[0].rawValue);
          } else {
            requestAnimationFrame(this.detectBarcode);
          }
        } else {
          this.stopScanner();
        }
      } catch (error) {
        console.error('Barcode detection failed: ', error);
        requestAnimationFrame(this.detectBarcode);
      }

    },
    addScannedItem(code) {
      let scannedObject = {
        code,
        quantity: 1,
      };

      if (this.showQuantity) {
        const existingItem = this.scannedItems.find(
          (item) => item.code === scannedObject.code
        );

        if (existingItem) {
          existingItem.quantity++;
        } else {
          this.scannedItems.push(scannedObject);
        }
      } else {
        this.scannedItems.push(scannedObject);
      }

      console.log(this.scannedItems);
      this.lastScannedCode = code;
      console.log(`Detected barcode: ${scannedObject.code}`);
    },
     mergeDuplicates() {
      const merged = [];
      this.scannedItems.forEach((item) => {
        const existing = merged.find((m) => m.code === item.code);
        if (existing) {
          existing.quantity += item.quantity ?? 1;
        } else {
          merged.push({ ...item });
        }
      });
      this.scannedItems = merged;
    },
    stopScanner() {
      this.liveStreamStart = false;
      this.scanning = false;
      if (this.videoStream) {

        const tracks = this.videoStream.getTracks();
        tracks.forEach(track => track.stop());
        this.videoStream = null;
      }


      this.barcode = null;
    },
    zoomIn() {
      this.zoomLevel += 0.1;
      this.updateZoom();
    },
    zoomOut() {
      if (this.zoomLevel > 1) {
        this.zoomLevel -= 0.1;
        this.updateZoom();
      }
    },
    updateZoom() {
      this.$refs.video.style.transform = `scale(${this.zoomLevel})`;
      this.$refs.video.style.objectPosition = 'center center';
    },
    handleSubmitData() {
     let jsonData;

      if (this.showQuantity === false) {

        jsonData = this.scannedItems.map(item => item.code);
      } else {
        jsonData = this.scannedItems.map(item => ({
          code: item.code,
          quantity: item.quantity
        }));
      }
      const encodedData = (JSON.stringify(jsonData));

      let config = {
        action: "open",
        url: "https://creatorapp.zoho.com/"+this.ownerName+"/"+this.appName+"/#Form:"+this.formName+"?"+this.fieldName+"="+encodedData+"",
        window: "same"
      };

      ZOHO.CREATOR.UTIL.navigateParentURL(config);

    }
  },
  watch: {
    showQuantity(newVal) {
      if (newVal) {
        this.mergeDuplicates();
      }
    },
  },
  mounted() {
    this.startScanner();
  },
  beforeRouteLeave(to, from, next) {

    this.stopScanner(to, from);
    next();
  },
  created() {
    ZOHO.CREATOR.UTIL.getInitParams()
    .then((params) => {
      this.ownerName=params.scope,
      this.appName = params.appLinkName
    })
  }

}
</script>
<style>
.frame {
  border-style: solid;
  border-width: 2px;
  border-color: red;
  height: 200px;
  width: 200px;
  position: absolute;
  top: 0px;
  bottom: 0px;
  right: 0px;
  left: 0px;
  margin: auto;
}


.video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  max-width: 600px;
  height: 300px;
  border-radius: 10px;
}

.text-center {
  text-align: center;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  touch-action: none;
}

.overlay-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  gap: 10px;
}

.scan-frame {
  width: 80%;
  height: 80%;
}

.barcode-result {
  margin-top: 10px;
  font-size: 18px;
  font-weight: 500;
}

.elipsis{
  text-overflow: ellipsis;
}

.last-code {
  display: inline-block;
  max-width: 80px; 
  overflow: hidden;
  white-space: nowrap;
  vertical-align: middle;
}

.full-overlay {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlayContent {
  width: 100%;
  height: 100%;
  color: lightgray;
}

.overlay-text {
  width: 80%;
  text-align: center;
}

/* .button-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
} */

.scanned-table-container {
  border-radius: 6px;
  overflow-x: hidden;
  overflow-y: auto;
}

.scanned-table thead {
  background-color: #f5f5f5;
  color: #333;
  font-weight: 600;
}

.scanned-table th,
.scanned-table td {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: center;
  font-size: 14px;
}

.scanned-table tbody tr td {
  border: none !important;
}

.quantity-cell {
  text-align: center;
  vertical-align: middle; 
  padding: 4px;        
}

.qty-wrapper {
  display: flex;
  align-items: center;  
  justify-content: center;
  gap: 6px;             
  overflow: hidden;     
}

.qty-value {
  min-width: 14px;
  text-align: center;
}

.quantity-cell span {
  display: inline-block;
  min-width: 24px;
  text-align: center;
  font-weight: 500;
}

.submit-btn {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;

  padding: 12px;
  background-color: rgb(48, 63, 159);
  color: white !important;
  border-radius: 10px;
  border: none;
  width: 90%;
  max-width: 400px;
  font-size: 16px;
  cursor: pointer;
}


@media (min-width: 768px) {
  .submit-btn {
    width: 20%;
  }
  .video-container {
    max-height: 300px;
  }
}

</style>