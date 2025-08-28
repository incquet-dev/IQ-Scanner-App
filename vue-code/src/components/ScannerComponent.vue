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
          <v-container fluid class="d-flex flex-column align-center">
          <v-card max-width="600" max-height="400" class="video-container">
            <video ref="video" class="video" autoplay playsinline webkit-playsinline muted></video>
            <div class="overlay-frame">
              <svg class="scan-frame" viewBox="0 0 512 512">
                <path d="M336 448h56a56 56 0 0056-56v-56M448 176v-56a56 56 0 00-56-56h-56M176 448h-56a56 56 0 01-56-56v-56M64 176v-56a56 56 0 0156-56h56" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="10" stroke="white"></path>
              </svg>
            </div>
            <v-row justify="center" class="zoom-controls">
                <v-icon color="gray" @click="zoomIn">mdi-magnify-plus-outline</v-icon>
                <v-icon color="gray" @click="zoomOut">mdi-magnify-minus-outline</v-icon>
            </v-row>
            <v-overlay
             v-if="overlay"
              absolute
              width="100%"
              height="100%"
              close-delay="0"
              class="full-overlay align-center justify-center"
              @click="overlay = false; detectBarcode();"
              
            >
              <div class="overlayContent  d-flex justify-center align-center flex-column" >
                <div >
                  <v-icon size="50" class="mb-2">mdi-barcode-scan</v-icon>
                </div>
                <div class="overlay-text" >
                  <span>Click to scan another Barcode or Qrcode </span>
                </div>
                
              </div>
            </v-overlay>
          </v-card>
         
         
         
        </v-container>
    </template>
    <script>


    
    
    import { BarcodeDetector } from 'barcode-detector';
    
    
    export default{
      data(){
        return{
          
          result:null,
          videoStream: null,
          liveStreamStart: false,
            scanning: false,
            zoomLevel: 1,
            overlay:true,
            scannedItems:[],
        }
      },
        components:{
          // QrStream,
          //QrcodeStream
           
        },
        methods:{
          
        async startScanner(){
          if(!('BarcodeDetector' in window)){
            console.error('Barcode Detector is not supported by this browser');
            return;
          }
    
          try{
            this.videoStream = await navigator.mediaDevices.getUserMedia({
              video:{
                facingMode:'environment',
                width:{ ideal : 1920},
                height : { ideal:1080},
              }
            })
    
            this.$refs.video.srcObject = this.videoStream;
              this.liveStreamStart = true;
              this.$refs.video.play();
              this.scanning = true;
              console.log("this is overlay",this.overlay);
              if(!this.overlay) this.detectBarcode();
          }catch(error){
            console.error('Error accessing the camera: ', error);
          }
        },
        async detectBarcode(){
          if(!this.scanning) return;
          const barcodeDetector = new BarcodeDetector({
            formats: [
                'code_128', 'ean_13', 'qr_code', 'aztec', 'codabar', 'code_39',
                'data_matrix', 'databar', 'databar_expanded', 'ean_8', 'itf',
                'upc_e', 'upc_a', 'rm_qr_code'
              ]
          });
    
          try {
            if(this.$refs.video){
              const barcodes = await barcodeDetector.detect(this.$refs.video);
              if (barcodes.length > 0) {
                this.overlay = true;
               
                
                let scannedObject = {
                    "scanned_code" : barcodes[0].rawValue,

                }
                console.log(scannedObject);
                this.scannedItems.push(scannedObject);
                console.log(this.scannedItems);
                console.log(`Detected barcode: ${scannedObject.code}`);
              } else {
                requestAnimationFrame(this.detectBarcode);
              }
            }else{
              this.stopScanner();
            }
            } catch (error) {
              console.error('Barcode detection failed: ', error);
              requestAnimationFrame(this.detectBarcode);
            }
    
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
          }
         
        },
        mounted() {
          this.startScanner();
        },
        beforeRouteLeave(to,from,next){
    
          this.stopScanner(to,from); 
        next();
        },
        created(){
         
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
      color:lightgray;
    }
      
    .overlay-text{
      width: 80%; 
      text-align: center;
    
    }
    </style>