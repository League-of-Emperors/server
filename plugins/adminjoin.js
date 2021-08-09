class Plugin {
    constructor(server) {

        server.createPluginConfigIfNotExist('adminjoin', {
            admins: []
        })
        const config = server.getPluginConfig('adminjoin')

        server.io.on('connection', socket => {
            socket.on('connect_player', data => {
                // TODO 
            })
        })
    }
}

module.exports = Plugin