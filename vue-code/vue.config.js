const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  outputDir:"../app",
  transpileDependencies: [
    'vuetify'
  ],
  devServer:{
    https:true,
  },
})
