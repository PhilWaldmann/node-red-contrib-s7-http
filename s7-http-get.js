

module.exports = function(RED) {
  function S7HTTPGetNode(config) {
    RED.nodes.createNode(this, config)
    const s7http = RED.nodes.getNode(config.s7http)

    if(!s7http){
      RED.log.error('no s7-http node configured!');
      return
    }

    const node = this
    const client = s7http.client

    if(!client) return

    // there are many values that are unknown.
    // extracted vie wireshark from s7 minivis java applets
    const data = [                                                                              //VARTYPE ?                   // VARAREA ?
      0x32, 0x01, 0x00, 0x00, 0x08, 0x19, 0x00, 0x0e, 0x00, 0x00, 0x04, 0x01, 0x12, 0x0a, 0x10, 0x05, 0x00, 0x01, 0x00, 0x01, 0x84, 0x00
    ]

    // the last 2 bytes are the variable offset
    const hex = (config.offset << 3).toString(16)
    for (var i = 0; i < hex.length; i += 2) {
      data.push(parseInt(hex.substring(i, i + 2), 16))
    }

    const interval = setInterval(function(){
      client.post('/sps7', Buffer.from(data))
      .then(function(result){
        const value = result.data.readInt16BE(result.data.length - 2) // last 2 byte seem to be the variable value for numeric types
        node.status({fill:'green', shape:'dot', text: value.toString()})

        node.send({
          payload: value
        })
      })
      .catch(function(error){
        RED.log.error(error)
      })
    }, config.interval)

    this.close = function(){
      clearInterval(interval)
    }
  }

  RED.nodes.registerType('s7-http-get', S7HTTPGetNode)
}

