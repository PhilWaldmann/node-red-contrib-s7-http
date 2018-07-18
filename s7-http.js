const axios = require('axios')

module.exports = function(RED) {
  function S7HTTPNode(config) {
    RED.nodes.createNode(this, config)

    this.client = axios.create({
      baseURL: 'http://' + config.ip + '/__S7Sys/get/bin/rs/' + config.rack +'/' + config.slot,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      responseType: 'arraybuffer',
      auth: {
        username: this.credentials.username,
        password: this.credentials.password
      }
    })
  }

  RED.nodes.registerType('s7-http', S7HTTPNode, {
    credentials: {
        username: {type:"text"},
        password: {type:"password"}
    }
  })
}
