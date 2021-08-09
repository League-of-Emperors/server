const [EpicCrate, MythicCrate, CommonCrate] = [require("../classess/Items/EpicCrate.class.js"), require("../classess/Items/MythicCrate.class.js"), require("../classess/Items/CommonCrate.class.js")]
const ItemArray = [EpicCrate, MythicCrate, CommonCrate]
const ItemArrayNames = ['EpicCrate', 'MythicCrate', 'CommonCrate']

class Plugin {
    constructor(server) {
        server.io.on('connection', socket => {
            socket.on('message_send', data => {
                const args = data.content.split(' ')
                if(args[0] == '!obtain') {

                    if(ItemArrayNames.includes(args[1]) == false) return

                    server.cities.forEach(city => {
                        if(city.CityMayor != data.author) return
                        const item = eval(`(function() { return (new ${args[1]}()) })()`)
                        city.Inventory.push(item)

                        server.io.emit('NOTIFICATION', {
                            color: '#8feb34',
                            icon: 'fas fa-box-open',
                            text: `Player ${city.CityMayor} has obtain ${item.name}`
                        })
                    })
                    return
                }

                else if(args[0] == '!spawn') {

                    server.cities.forEach(city => {
                        if(city.CityMayor != data.author) return
                        city.People += parseInt(args[1])
                    })
                    return
                }

                else if(args[0] == '!bonusgold') {

                    server.cities.forEach(city => {
                        if(city.CityMayor != data.author) return
                        city.Gold += 5000
                    })
                    return
                }
                server.io.emit('message', data)
            })
        })
    }
}

module.exports = Plugin