/**
 * 
 * @author Maciej Dębowski
 * @version 2.0.1_beta
 * @copyright Maciej Dębowski
 * 
 * @license LICENSE
 * 
 */

"process*"

const express = require("express")
const socket = require("socket.io")
const fs = require("fs")
const Lib = require("./libs/lib.js")
const SimplexNoise = require("simplex-noise")
const simplex = new SimplexNoise()

const [Farm, Mine, Lumbermill, Vault, Granary] = [require("./classess/Building/Farm.class.js"), require("./classess/Building/Mine.class.js"), require("./classess/Building/Lumbermill.class.js"), require("./classess/Building/Vault.class.js"), require("./classess/Building/Granary.class.js")]
const BuildingsArray = [Farm, Mine, Lumbermill, Vault, Granary]

const [Drake, Chonk] = [require("./classess/Mobs/Drake.class.js"), require("./classess/Mobs/Chonk.class.js")]
const MobsArray = [Drake, Chonk]

const seed = parseInt(Math.random() * 2048)

const FPS = 1

/* Util function */

function randint(min, max) { // -10 20
    return parseInt(Math.random() * (max + min)) - min
}

/* Colors */
const colorSuccess = '#8feb34'
const colorDanger = '#f2594e'
const colorInfo = '#21dbcf'

/* PROTOTYPES */

Array.prototype.getMainBiomeOf = function() {

    const chunksId = []

    this.forEach(biome => {
        chunksId.push(biome.chunkType)
    })

    return sortArrayToGetMostOccoroped(chunksId)
}

/* Utility classes */

class Activity {
    constructor(to, type) {
        /**
         * 
         * type:
         * war
         * 
         */
        this.to = to
        this.type = type || "war"
    }
}

class City {
    constructor(CityName, CityMayor, x, y) {
        this.CityName = CityName
        this.CityMayor = CityMayor
        this.Gold = 5000
        this.People = 750
        this.TaxRate = 1
        this.IsAnarchy = false
        this.Happiness = .8
        this.Size = 10
        this.Army = 25
        this.MaxGold = 75000
        this.MaxFood = 5000

        this.Food = 1850
        this.Wood = 700
        this.Stone = 350
        this.Metal = 200
        
        this.x = x
        this.y = y
        this.Activities = []

        this.unlock_trading = true // People from other cities can sold item in city
        this.people_can_go_out = true // People can go out of city
        this.export_products = true // People can sell products in other cities.

        this.buildings = [new Farm()]
        this.protection = .4
    }
}

/* Main server class */

class Server {
    constructor(config = {}) {
        this.http = express()
        this.io = socket(config["websocket-port"], {
            path: '/',
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
            cors: {
                origin: "http://"+config.ipaddress,
                methods: ["GET", "POST"]
            }
        })

        this.plugins = []
        this.lib = Lib
        this.config = config
        this.map = []
        this.cities = []
        this.seed = seed
        this.players = []
        this.Bots = 0
        this.Mobs = [new Drake(randint(0,50),randint(0,50)), new Chonk(randint(0,50),randint(0,50))]

        this.mapX = this.config.mapX
        this.mapY = this.config.mapY

        this.maxX = 25 * this.config.mapX - 25 // averange chunk size * chunks - 25 (-25 for sure that map wouldn't generate smaller :))
        this.maxY = 25 * this.config.mapY - 25 // averange chunk size * chunks - 25 (-25 for sure that map wouldn't generate smaller :))

        this.log_file_name = `${Lib.datetime.fileFormatedDateTime()}_LOG.log` // Date when server starts :)
        fs.writeFileSync(`./logs/${this.log_file_name}`, ``)

        /* Creating listen on GET '/' path */

        this.http.use(express.static('scripts'))

        this.http.get('/', (req, res) => {
            res.sendFile(__dirname + '/client/client.html')
        })
        
        this.http.get('/icons', (req, res) => {
            res.sendFile(__dirname + '/client/icons.tplx.html')
        })
        
        this.http.get('/credits', (req, res) => {
            res.sendFile(__dirname + '/client/credits.html')
        })

        /* Creating map */

        this.createMap()

        /* Creating Bot Cities */
            for(let i = 0; i < 5; i++) {
                this.createBotCity()
            }
        /* END */

        setInterval(() => this.io.emit('MAP_UPDATE', this.map), 1000) // Map Update 1 time per 1 second
        //setInterval(() => this.io.emit("PLAYER_CITY_BUILDINGS_ALL", this.cities), 1000)
        setInterval(() => this.mobsMovement(), (1000 / FPS))
        setInterval(() => {

            // At some time, create a bot city :)!
            if(parseInt(Math.random() * 65536) == 0) {
                this.createBotCity()
            }

            this.spawnMobs()
            this.io.emit('MOB_UPDATE', this.Mobs)

            /**
             * UPDATE STATISCTICS FOR EVERY CITY
             */

            this.cities.forEach(city => {
                city.Gold += (city.People / 15 * city.TaxRate)
                city.People += (city.People / 2 / 356 / 3) // Every 2 people make baby. It's took 356 days and average they do it 1 per 3 years :)
                city.Happiness = .7
                city.Happiness -= (city.TaxRate / 5)
                city.Happiness += (city.Happiness / 10)
                city.Happiness -= (city.unlock_trading == false) ? .03 : 0
                city.Happiness -= (city.people_can_go_out == false) ? .03 : 0

                city.Happiness -= (city.Food < city.People) ? .3 : 0

                city.Food -= (city.People * .75)
                city.Food = city.Food < 0 ? 0 : city.Food

                if(city.Food < city.People) {
                    city.People -= (city.People * .07)
                }

                let foodBoost = 1, mineBoost = 1, woodBoost = 1

                foodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 0) ? 2 : foodBoost // PLAINS
                foodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 5) ? 0.2 : foodBoost //  MOUNTAINS
                foodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 3) ? 0 : foodBoost //  OCEAN
                foodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 1) ? 0.1 : foodBoost //  DESERT
                foodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 6) ? 0.75 : foodBoost // TUNDRA
                foodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 2) ? 1.25 : foodBoost // FOREST

                woodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 0) ? .5 : woodBoost // PLAINS
                woodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 5) ? 0.5 : woodBoost //  MOUNTAINS
                woodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 3) ? 0.15 : woodBoost //  OCEAN
                woodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 1) ? 0.225 : woodBoost //  DESERT
                woodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 6) ? 1.30 : woodBoost // TUNDRA
                woodBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 2) ? 1.30 : woodBoost // FOREST

                mineBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 0) ? .5 : mineBoost // PLAINS
                mineBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 5) ? 2 : mineBoost //  MOUNTAINS
                mineBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 3) ? 0.15 : mineBoost //  OCEAN
                mineBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 1) ? 0.45 : mineBoost //  DESERT
                mineBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 6) ? .5 : mineBoost // TUNDRA
                mineBoost = (getMainBiomeOfCity(city.CityName).getMainBiomeOf() == 2) ? .5 : mineBoost // FOREST

                city.MaxGold = 75000
                city.MaxFood = 5000

                city.buildings.forEach(building => {
                    if(city.People > 0.99) {
                        city.Food += (building.produceFoodPerRound * foodBoost * building.upgradeLevel)
                        city.Wood += ((building.WoodPerRound * woodBoost / 5) * building.upgradeLevel)
                        city.Stone += ((building.StonePerRound * mineBoost / 5) * building.upgradeLevel)
                        city.Metal += ((building.MetalPerRound * 1 / 5) * building.upgradeLevel)
                        city.MaxGold += (building.increseMaxGold * 1 / 5 * building.upgradeLevel) 
                        city.MaxFood += (building.increseMaxFood * 1 / 5 * building.upgradeLevel) 
                    }
                    
                })

                
                

                if(city.Gold > city.MaxGold) {
                    city.Gold = city.MaxGold
                }

                if(city.Food > city.MaxFood) {
                    city.Food = city.MaxFood
                }
            
                if(city.isBot != undefined && city.isBot == true) {

                    /* Check if can upgrade any building */
                    city.buildings.forEach(building => {
                        let price_of_upgrade = (building.price * building.upgradeLevel) * 1.4
                        if(city.Gold < price_of_upgrade) return

                        city.Gold -= price_of_upgrade
                        building.upgradeLevel++
                        this.log(`${city.CityMayor} has upgraded a ${building.name} from ${building.upgradeLevel-1} level to ${building.upgradeLevel} level`)
                    })

                    /* Check if can enlarge city */

                    if(city.Gold > (city.Size * 5000 * .985025)) {
                        city.Gold -= (city.Size * 5000 * .985025)
                        city.Size++
                    }

                    /* Check if can build any building */
                    BuildingsArray.forEach(building => {
                        const instance = new building()

                        if (
                            city.Gold > instance.price
                            && city.Metal > instance.price_metal
                            && city.Stone > instance.price_stone
                            && city.Wood > instance.price_wood
                        ) {
                            let canBuild = true
                            city.buildings.forEach(building => {
                                if(building.name == instance.name) canBuild = false
                            })

                            if(canBuild == false) return

                            city.buildings.push(instance)
                            city.Gold -= instance.price
                            city.Wood -= instance.price_wood
                            city.Stone -= instance.price_stone
                            city.Metal -= instance.price_metal   
                            
                            this.log(`${city.CityMayor} has built a ${instance.name}`)
                        }
                    }) 
                }
            })
        }, 1000) // Update all cities and send them to players


        setInterval(() => this.io.emit('CITIES_UPDATE', this.cities), 1000) // Sending cities to player
        if(this.config.enlarge.doEnlarge == true) setInterval(() => this.enlargeMap(), this.config.enlarge.enlargeTimeout)

        /* Socket on connection */


        this.io.on('connection', async (socket) => {
            socket.on('connect_player', data => {
                /* Player Connected! */
                this.io.emit('MAP_UPDATE', this.map)
                this.io.emit('CITIES_UPDATE', this.cities)
                this.io.emit("PLAYER_CITY_BUILDINGS_ALL", this.cities)

                this.io.emit("NOTIFICATION", {
                    icon: 'fas fa-plus',
                    color: colorSuccess,
                    text: `Player ${data} connected to server!`,
                })

                this.cities.forEach(city => {
                    if(city.CityMayor != data) return;
                })

                this.players.push({
                    nick: data,
                    state: 'connected',
                    id: socket.id
                })
            })

            socket.on('CREATE_CITY', data => {

                if(data.x > this.config.mapX || data.y > this.config.mapY) return;

                this.cities.push(new City(data.name, data.mayor, data.x, data.y))
                this.log(`Player ${data.mayor} create city ${data.name} `)
                this.io.emit('CITIES_UPDATE', this.cities)
                this.cities.forEach(city => {
                    if(city.CityMayor == data.CityMayor) {
                        socket.emit("PLAYER_CITY_BUILDINGS", city)
                    }
                })

                socket.emit("NOTIFICATION", {
                    icon: 'fas fa-check',
                    color: colorSuccess,
                    text: 'Succesfully created city!',
                })

                this.io.emit("NOTIFICATION", {
                    icon: 'fas fa-info',
                    color: colorInfo,
                    text: `Player ${data.mayor} created city ${data.name}`,
                })

                this.io.emit("CITY_CREATED_NEW", {
                    CityName: data.name,
                    CityMayor: data.mayor
                })
            })

            socket.on('BATTLE_START', data => {
                // BATTLE
                const attacker = data.from, defender = data.to;
                let attackerCity = undefined, defenderCity = undefined

                this.cities.forEach(city => {
                    if(city.CityMayor == attacker) attackerCity = city
                    else if(city.CityMayor == defender) defenderCity = city
                })

                let attackerTroops = attackerCity.Army,
                    defenderTroops = defenderCity.Army

                let alive_defenders = Math.max(defenderTroops - attackerTroops, 0)
                let alive_attackers = Math.max(attackerTroops - defenderTroops, 0)

                let grab = 0, kills_civils = 0

                if(alive_defenders <= 0) {
                    // GRAB!
                    let grab_per_once = 175
                    grab = alive_attackers * grab_per_once

                    kills_civils = (alive_attackers < 0) ? 0 : alive_attackers * 3.5

                    this.cities.forEach(city => {
                        if(city.CityMayor == attacker) {
                            city.Gold += grab
                        }
                        else if(city.CityMayor == defender) {
                            city.Army = alive_defenders
                            city.Gold -= grab
                            city.People = city.People - kills_civils

                            if(city.People < 0) {
                                city.People = 0
                            }
                        }
                    })
                    
                }

                this.io.emit("message", {
                    content: `Player ${attacker} attacks ${defender} with ${attackerCity.Army} troops. Attacker loot ${grab} and kill ${kills_civils}`,
                    author: '<br>'
                })

                socket.emit("NOTIFICATION", {
                    icon: 'fas fa-check',
                    color: colorSuccess,
                    text: `Successful send ${attackerCity.Army} troops to ${defender}!`,
                })

                this.cities.forEach(city => {
                    if(city.CityMayor == attacker) {
                        city.Army = alive_attackers
                    }
                    else if(city.CityMayor == defender) {
                        city.Army = alive_defenders
                    }
                })
                
            })

            socket.on('CITY_BUILD_BUILDING', data => {
                /**
                 *
                 * @object data model:
                 * @var BuildingName
                 * @var CityMayor
                 * 
                */

                this.cities.forEach(city => {
                    if(city.CityMayor == data.CityMayor) {
                        // We Got this CITY!

                        const instanceOfThisBuilding = eval(`(function() { return (new ${data.BuildingName}()) })()`)
                        if(city.Gold >= instanceOfThisBuilding.price && city.Wood >= instanceOfThisBuilding.price_wood && city.Stone >= instanceOfThisBuilding.price_stone && city.Metal >= instanceOfThisBuilding.price_metal) {
                            let isThereBuilded = false
                            city.buildings.forEach(building => {
                                // instanceof eval(`(function() { return ${data.BuildingName};})()`)
                                if(building.name == instanceOfThisBuilding.name) {
                                    // gotit!
                                    isThereBuilded = true
                                }
                            })

                            if(isThereBuilded == false) {
                                city.buildings.push(instanceOfThisBuilding)
                                city.Gold -= instanceOfThisBuilding.price
                                city.Wood -= instanceOfThisBuilding.price_wood
                                city.Stone -= instanceOfThisBuilding.price_stone
                                city.Metal -= instanceOfThisBuilding.price_metal
                                socket.emit("PLAYER_CITY_BUILDINGS", city)
                                socket.emit("NOTIFICATION", {
                                    icon: 'fas fa-check',
                                    color: colorSuccess,
                                    text: `Successful builded ${instanceOfThisBuilding.name}`,
                                })

                                this.log(`Player ${city.CityMayor} created building ${data.BuildingName}`)
                            }
                            else {
                                socket.emit("NOTIFICATION", {
                                    icon: 'fas fa-times',
                                    color: colorDanger,
                                    text: 'You had arleady build this!',
                                })
                            }
                            
                            
                        }
                        else {
                            socket.emit("NOTIFICATION", {
                                icon: 'fas fa-times',
                                color: colorDanger,
                                text: 'You don\'t have enought materials',
                            })
                            return;
                        }

                    }
                })
            })

            socket.on('RECRUIT_ARMY', data => {
                /**
                 * 
                 * @object data model:
                 * @var CityMayor
                 * @var Troops
                 * 
                 * 
                 */


                const troops = parseInt(data.Troops), price = troops * 100

                this.cities.forEach(city => {
                    if(city.CityMayor != data.CityMayor) return;
                    if(city.People < troops) return;
                    if(city.Gold > price) {
                        city.Army += troops
                        city.People -= troops
                        city.Gold -= price

                        this.io.emit('CITIES_UPDATE', this.cities)
                        this.io.emit("PLAYER_CITY_BUILDINGS", city)
                    }
                })
            })

            socket.on('UPDATE_CITY_OPTIONS', data => {
                /**
                 *
                 * @object data model:
                 * @var CityMayor
                 * @var TaxRate
                 * @var ExportItems
                 * @var ImportItems
                 * @var LetPeopleOut
                 * 
                */

                this.log(`Player ${data.CityMayor} update options of his city.`, data)

                this.cities.forEach(city => {

                    if(city.CityMayor == data.CityMayor) {
                        // That's our city!

                        city.TaxRate = data.TaxRate != undefined ? data.TaxRate : city.TaxRate
                        city.unlock_trading = data.ImportItems != undefined ? data.ImportItems : city.unlock_trading
                        city.people_can_go_out = data.LetPeopleOut != undefined ? data.LetPeopleOut : city.people_can_go_out
                        city.export_products = data.ExportItems != undefined ? data.ExportItems : city.export_products

                        this.io.emit('CITIES_UPDATE', this.cities)

                    }

                })
            })

            socket.on('message_send', data => {
                this.io.emit('message', data)
            })

            /**
             *
             * @event UPGRADE_BUILDING
             * callback
             * 
             * @param data
             * contains:
             * CityMayor,
             * BuildingName
             *  
            */

            socket.on('UPGRADE_BUILDING', data => {
                this.cities.forEach(city => {
                    if(city.CityMayor != data.CityMayor) return;

                    city.buildings.forEach(build => {
                        if(build.name != data.BuildingName) return;
                        let priceOf = ((build.price * build.upgradeLevel) * 1.4)
                        if(city.Gold >= priceOf) {
                            build.upgradeLevel++
                            city.Gold -= priceOf
                            this.io.emit('CITIES_UPDATE', this.cities)
                            this.io.emit("PLAYER_CITY_BUILDINGS", city)

                            socket.emit("NOTIFICATION", {
                                icon: 'fas fa-check',
                                color: colorSuccess,
                                text: `Successful upgraded ${build.name}!`,
                            })
                        }
                        else {
                            socket.emit("NOTIFICATION", {
                                icon: 'fas fa-times',
                                color: colorDanger,
                                text: 'Not enought resources!',
                            })
                        }
                    })
                })
            })

            /**
             * 
             * The @param data tooks
             * @param CityMayor
             * 
             */

            socket.on('ENLARGE_CITY', data => {
                /**
                 * 
                 * Enlarging city
                 * @var citySize;
                 * @var price = citySize * 5000 * .985025;
                 * 
                 */

                this.cities.forEach(city => {
                    if(city.CityMayor != data.CityMayor) return

                    /* Got it! */
                    let enlarge_multiplier = .985025;
                    let price_per_chunk = 5000

                    let citySize = city.Size
                    let price_for_chunx = citySize * price_per_chunk * enlarge_multiplier

                    if(city.Gold < price_for_chunx) {
                        socket.emit("NOTIFICATION", {
                            icon: 'fas fa-times',
                            color: colorDanger,
                            text: 'Not enought gold to enlarge!',
                        })
                        return
                    }

                    city.Gold -= price_for_chunx
                    city.Size++
                    this.io.emit('MAP_UPDATE', this.map)
                    this.io.emit('CITIES_UPDATE', this.cities)

                    socket.emit("NOTIFICATION", {
                        icon: 'fas fa-check',
                        color: colorSuccess,
                        text: 'Succesfully enlarged city!',
                    })
                })
            })
        })

        /* Listening a server */

        this.http.listen(config.port, () => this.log('Server started'))

        /* Plugins */

        fs.readdirSync('./plugins/').forEach(plugin => {
            const plugin_class = require("./plugins/" + plugin)
            this.plugins.push(new plugin_class(this))
        })    
    }

    createBotCity() {
        let alphabet = 'abcdefghijklmnoprstuwxyz'
        let name = ''

        let letters = parseInt(Math.random() * 6) + 10 // city name length
        for(let letter = 0; letter < letters; letter++) {
            name += alphabet[parseInt(Math.random() * alphabet.length)]
        }

        const [x, y] = [parseInt(Math.random() * this.config.mapX), parseInt(Math.random() * this.config.mapY)]

        const CityInstance = new City(name, `Bot${this.Bots + 1}`, x, y)
        CityInstance.isBot = true
        CityInstance.Gold += parseInt(Math.random() * 15000)
        CityInstance.People += (-500) + parseInt(Math.random() * 1000)

        this.io.emit("NOTIFICATION", {
            icon: 'fas fa-info',
            color: colorInfo,
            text: `Bot Bot${this.Bots + 1} created city ${name}`,
        })

        this.cities.push(CityInstance)
        
        this.Bots++
    }

    spawnMobs() {
        // MobsArray
        /**
         * 
         * Spawning mobs
         * 
         */

        let random0to100 = Math.random() * 100 // float

        for(let i = 0; i < MobsArray.length; i++) {
            const mob = MobsArray[i]
            const instance = new mob(0,0)

            let doContinue = false
            this.Mobs.forEach(currentMob => {
                if(currentMob.name == instance.name) doContinue = true;
            })

            if(doContinue == true) continue

            if(random0to100 < instance.rarity) { // if random number lower than rarity then spawn mob

                const [x, y] = [randint(0, this.config.mapX), randint(0, this.config.mapY)]
                instance.x = x
                instance.y = y
                this.Mobs.push(instance)

                this.io.emit('NOTIFICATION', {
                    icon: 'fas fa-info',
                    color: instance.color,
                    text: `${instance.name} has arrived!`
                })

                this.io.emit('MOB_UPDATE', this.Mobs)

            }

        }
    }

    log(text, jsondata) {
        let currentLogs = fs.readFileSync(`./logs/${this.log_file_name}`, 'utf8')
        currentLogs += `\n[Server INFO] > [${Lib.datetime.time()}] > ${text} ${jsondata != undefined ? 'JSON DATA: ' + JSON.stringify(jsondata) : ''}`
        fs.writeFileSync(`./logs/${this.log_file_name}`, currentLogs)

        if(text != "")
            console.log(`[Server INFO] > [${Lib.datetime.time()}] > ${text}`)
    }

    enlargeMap() {
        for(let i = 0; i < this.config.enlarge.enlargeAtOnce; i++) {
            for(let x = 0; x < this.mapX; x++) {
                const height = parseInt(Math.abs(simplex.noise2D(x - seed, this.mapY+1 + seed)) * 100) % 100
                this.map.push({
                    x: x,
                    y: this.mapY+1,
                    color: '',
                    chunkType: Lib.biomes.getBiomeByCoordinates(seed, x, this.mapY+1, height),
                    height: height, // max height is 100 :)
                    size: parseInt(Math.random() * 10) + 20 
                })
            }

            for(let y = 0; y < this.mapY; y++) {
                const height = parseInt(Math.abs(simplex.noise2D(this.mapX+1 - seed, y + seed)) * 100) % 100
                this.map.push({
                    x: this.mapX+1,
                    y: y,
                    color: '',
                    chunkType: Lib.biomes.getBiomeByCoordinates(seed, this.mapX+1, y, height),
                    height: height, // max height is 100 :)
                    size: parseInt(Math.random() * 10) + 20 
                })
            }
            const height = parseInt(Math.abs(simplex.noise2D(this.mapX+1 - seed, this.mapY+1 + seed)) * 100) % 100
            this.map.push({
                x: this.mapX+1,
                y: this.mapY+1,
                color: '',
                chunkType: Lib.biomes.getBiomeByCoordinates(seed, this.mapX+1, this.mapY+1, height),
                height: height, // max height is 100 :)
                size: parseInt(Math.random() * 10) + 20 
            })

            this.mapX++
            this.mapY++
        }
        
    }

    mobsState() {
        this.Mobs.forEach((mob, key) => {
            if(mob.hp < 0 && mob.died == false) {
                setTimeout(() => {
                    mob.completlyDie = true
                    this.Mobs.splice(key, 1)
                }, 4000)
                setInterval(() => {
                    mob.dieStep++
                }, 1000 )

                mob.died = true
            }
        })
    }

    mobsMovement() {
        /**
         * Mobs Movement
         * 
         */

        this.Mobs.forEach(mob => {
            // Calculating axis of movement for every mob in every direection then add it to them XY pos
            let xVelocity = (parseInt(Math.random() * 20) - 10) / 20, yVelocity = (parseInt(Math.random() * 20) - 10) / 20
            mob.x += xVelocity
            mob.y += yVelocity

            // DELETE THIS AFTER TEST
            mob.hp -= 200

            // Check if mob in map

            if(mob.x < 1) {
                mob.x = 1
            }

            if(mob.y < 1) {
                mob.y = 1
            }

            if(mob.x > this.config.mapX) {
                mob.x = this.config.mapX - 1
            }

            if(mob.y > this.config.mapY) {
                mob.y = this.config.mapY - 1
            }

        })

        this.io.emit('MOB_UPDATE', this.Mobs)

        this.mobsState()
    }

    createMap() {
        for(let x = 0; x < this.config.mapX; x++) {
            for(let y = 0; y < this.config.mapY; y++) {
                const height = parseInt(Math.abs(simplex.noise2D(x - seed, y + seed)) * 100) % 100
                this.map.push({
                    x: x,
                    y: y,
                    color: '',
                    chunkType: Lib.biomes.getBiomeByCoordinates(seed, x, y, height),
                    height: height, // max height is 100 :)
                    size: parseInt(Math.random() * 10) + 20 

                    /**
                     * For developers :)
                     * 
                     * How to calculate +- map size
                     * @var a = 20 + rand(10) // size of chunk
                     * @var averange_a = 25 // average chunk have 25 size
                     * @var mapX // this u get from config.json file
                     * @var mapY // this u get from config.json file
                     * 
                     * @var averageMaxX = mapX * averange_a
                     * @var averageMaxY = mapY * averange_a
                     * 
                     * Don't use it for marking max city pos 
                     * 
                     */
                })
            }
        }
    }
}

const server = new Server(require("./config.json")) 

// utils
function getMainBiomeOfCity(name) {
    let biome_ = []
    if(name == undefined) return;
    server.cities.forEach(city => {

        /* Getting closest chunk to city. */

        if(city.CityName != name) return;

        const [cityX, cityY] = [city.x, city.y]
        let closestBiome = {}

        server.map.forEach(chunk => {
            if (
                chunk.x > (city.x)
                && chunk.y > (city.y)
                && chunk.y < (city.y + city.Size / 5)
                && chunk.x < (city.x + city.Size / 5)
                && chunk.height > 34
            ) {
                biome_.push(chunk)
            }
        })
    })
    return biome_
}

function sortArrayToGetMostOccoroped(array)
{
    if(array.length == 0)
        return null;
    let modeMap = {};
    let maxEl = array[0], maxCount = 1;
    for(let i = 0; i < array.length; i++)
    {
        let el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}
