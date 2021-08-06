class Plugin {
    constructor(server) {
        server.io.on('connect_player', data => {
            server.log(data)
        })
    }
}

module.exports = Plugin