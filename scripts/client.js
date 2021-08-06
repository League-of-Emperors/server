// #==# <- Axolotl face :)

import Renderer from './renderer.js'
import Biomes from './biomes.js'
import Origin from './config.js'

/* Initializating socket.io */
const socket = io('ws://'+Origin+':801')

/* Getting player name */
const name = localStorage.getItem('player_name')
if(name == undefined) {
    localStorage.setItem('player_name', prompt('Podaj nazwe użytkownika: '))
    window.location.href = window.location
}

/* BigTooltips */
function appendTooltip() {
    function createTooltip(x, y, text, element) {
        const tooltip = document.createElement("div")
        document.body.appendChild(tooltip)

        tooltip.classList.add("tooltip")
        tooltip.style.background = element.dataset.tooltipbackground

        if(element.getAttribute("data-tooltip-height")) tooltip.style.height = element.getAttribute("data-tooltip-height") + "px"
        if(element.getAttribute("data-tooltip-width")) tooltip.style.width = element.getAttribute("data-tooltip-width") + "px"

        tooltip.style.top = `${y + 50}px`
        tooltip.style.left = `${x - (element.getAttribute("data-tooltip-width") / 2) + 10}px`

        tooltip.innerHTML = text
    }

    const tooltips = document.querySelectorAll("[data-tooltip-big]")

    tooltips.forEach(tooltip => {
        tooltip.addEventListener("mouseover", function() {
            const metrics = tooltip.getBoundingClientRect()
            createTooltip(metrics.x, metrics.y, tooltip.getAttribute("data-tooltip-big"), tooltip)
        })

        tooltip.addEventListener("mouseout", function() {
            document.querySelectorAll(".tooltip").forEach(div => div.remove())
        })
    })
}

/* BigTooltips End */

/* MAP */
let map = []
let cities = []
let mobs = []

/* Canvas / Canvas Context */
const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight - 60

    updateMap()
    drawCities()
}

resize()

window.addEventListener('resize', resize)

let ScaleX = 20
let ScaleY = 20

let MaxZoom = 50
let MinZoom = 5

let minOffsetX = 0
let minOffsetY = 0

let offsetX = 0
let offsetY = 0

const renderer = new Renderer(ctx)

/* Zooming IN/OUT */

canvas.addEventListener("wheel", (e) => {
    ScaleX += e.deltaY * -0.01;
    ScaleY += e.deltaY * -0.01;

    ScaleX = ScaleX < MinZoom ? MinZoom : ScaleX
    ScaleX = ScaleX > MaxZoom ? MaxZoom : ScaleX

    ScaleY = ScaleY < MinZoom ? MinZoom : ScaleY
    ScaleY = ScaleY > MaxZoom ? MaxZoom : ScaleY

    updateMap()
    drawCities()
})

/* Moving around / DRAGGING */

const mouse = {
    x: 0,
    y: 0,
}


let dragging = false
let prev = [0,0]
canvas.addEventListener("mousedown", (e) => {
    dragging = true
    prev = [e.clientX, e.clientY]
    document.body.style.cursor = 'grab'
})
canvas.addEventListener("mouseup", () => {
    dragging = false
    document.body.style.cursor = 'default'
})

canvas.addEventListener("mousemove", (e) => {
    // moving

    mouse['x'] = e.clientX
    mouse['y'] = e.clientY - 60 // - 60 cuz we have 60px topbar :)

    if(dragging == true) {
        let now = [e.clientX, e.clientY]
        if(now[0] > prev[0]) {
            offsetX -= (5 / ScaleX)
        }
        else if(now[0] < prev[0]){
            offsetX += (5 / ScaleX)
        }

        if(now[1] > prev[1]) {
            offsetY -= (5 / ScaleY)
        }
        else if(now[1] < prev[1]){
            offsetY += (5 / ScaleY)
        }
        prev = now

        if(offsetX < minOffsetX) offsetX = minOffsetX
        if(offsetY < minOffsetY) offsetY = minOffsetY

        updateMap()
        drawCities()
    }

    
})

/* Emiting that player is connect to the server */
socket.emit('connect_player', name)

/* Trying to get map from server */
socket.on('MAP_UPDATE', data => {
    map = data
    updateMap()
    drawCities()
    renderMobs()
})

/* Trying to get cities from server (once per second server emit cities) */
socket.on('CITIES_UPDATE', data => {
    cities = data
    document.querySelector("#city-name").innerHTML = GetPlayerCity(name) == undefined ? 'Not city yet' : GetPlayerCity(name).CityName
    document.querySelector("#city-manager-city-name").innerHTML = GetPlayerCity(name) == undefined ? 'Not city yet' : GetPlayerCity(name).CityName
    drawCities()
    renderMobs()

    /* If city exist, give it stats */

    if(GetPlayerCity(name) != undefined) {
        // City Exist
        const city = GetPlayerCity(name)
        document.querySelector("#range-tax-rate").value = city.TaxRate
        document.querySelector("#unlock-trading").checked = city.unlock_trading
        document.querySelector("#allow-people-go-out").checked = city.people_can_go_out
        document.querySelector("#export-items").checked = city.export_products
        document.querySelector("#army-count").innerHTML = city.Army
        
        document.querySelector("#enlarge-price span").innerHTML = (city.Size * 5000 * .985025)
    }
})

/* Updating options / sending packets with them to server on changes */
 // TAX RATE
document.querySelector("#range-tax-rate").addEventListener("change", () => {
    if(GetPlayerCity(name) != undefined) {
        socket.emit('UPDATE_CITY_OPTIONS', {
            CityMayor: name,
            TaxRate: document.querySelector("#range-tax-rate").value
        })
    }
})

 // CHECKBOXES

document.querySelector("#unlock-trading").addEventListener("click", () => {
    if(GetPlayerCity(name) != undefined) {
        socket.emit('UPDATE_CITY_OPTIONS', {
            CityMayor: name,
            ImportItems: document.querySelector("#unlock-trading").checked
        })
    }
})

document.querySelector("#allow-people-go-out").addEventListener("click", () => {
    if(GetPlayerCity(name) != undefined) {
        socket.emit('UPDATE_CITY_OPTIONS', {
            CityMayor: name,
            LetPeopleOut: document.querySelector("#allow-people-go-out").checked
        })
    }
})

document.querySelector("#export-items").addEventListener("click", () => {
    if(GetPlayerCity(name) != undefined) {
        socket.emit('UPDATE_CITY_OPTIONS', {
            CityMayor: name,
            ExportItems: document.querySelector("#export-items").checked
        })
    }
})

function showPlayerCityStatistics() {
    const city = GetPlayerCity(name)

    if(city == undefined) return;
    document.querySelector("#city-gold span").innerHTML = Math.floor(city.Gold) + ' / ' + Math.floor(city.MaxGold) // GOLD!
    document.querySelector("#city-people span").innerHTML = Math.floor(city.People) // PEOPLE!
    document.querySelector("#city-food span").innerHTML = Math.floor(city.Food) + ' / ' + Math.floor(city.MaxFood) // FOOD!
    document.querySelector("#city-metal-plate span").innerHTML = Math.floor(city.Metal) // METAL!
    document.querySelector("#city-stone span").innerHTML = Math.floor(city.Stone) // STONE!
    document.querySelector("#city-wood span").innerHTML = Math.floor(city.Wood) // WOOD!

    const colors__ = ['rgb(60, 158, 36)', 'rgb(255, 217, 0)', 'rgb(241, 39, 39)'].reverse() // It will be bad then medium then good (red, yellow, orange)

    document.querySelector("#happiness-level").style.color = colors__[Math.round(city.Happiness * 3)]
}

function drawCities() {
    
    cities.forEach(city => {
        let color = 'red'

        if(city.CityMayor == name) color = 'black'

        renderer.renderCircleBorder(
            city.x * ScaleX - offsetX * ScaleX + (city.Size * (ScaleX / 22)) / 2,
            city.y * ScaleY - offsetY * ScaleY + (city.Size * (ScaleY / 22)) / 2,
            city.Size * (ScaleX / 22),
            color
        )
    })
    showPlayerCityStatistics()
}

function updateMap() {

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    let windowY = window.innerWidth,  windowX = window.innerHeight
    for(let y = 0; y < 100; y++) {
        let __y = 0
        let __x = 0
        map.forEach(chunk => {


            if(chunk.chunkType == 3) {
                if(y == 0) {
                    renderer.render(chunk.x * ScaleX - offsetX * ScaleX, chunk.y * ScaleY - offsetY * ScaleY, chunk.size * (ScaleX / 22), Biomes[chunk.chunkType].color)
                }
            }
            else {
                if(chunk.height == y) {

                    if(__x > windowX) return;

                    if(windowY > __y) {
                        renderer.render(chunk.x * ScaleX - offsetX * ScaleX, chunk.y * ScaleY - offsetY * ScaleY, chunk.size * (ScaleX / 22), Biomes[chunk.chunkType].color)
                        __y += chunk.size  
                    }
                    else {
                        __y = 0
                        __x += 15
                    }
                    
                } 
            }

           
        }) 
    }  

    renderMobs()
}

/* Canvas Click Event ( Creating city ) */
canvas.addEventListener("dblclick", () => {
    if(GetPlayerCity(name) != undefined) return; // Player Have City!

    const
        x = mouse.x/ScaleX+offsetX,
        y = mouse.y/ScaleY+offsetY

    socket.emit('CREATE_CITY', { name: (prompt('City name: ') || 'The Great Kingdom!'), mayor: name, x:x,y:y })
})

/** 
 *  Function to get player city
 *  @param PlayerName
 *  @returns Player city instance or undefined when city doesn't exist
*/

function GetPlayerCity(PlayerName) {
    let cit = undefined
    cities.forEach(city => {
        if(city.CityMayor == PlayerName) cit = city
    })

    return cit
}

/* Chat */


// TODO: cannot send 2 times a message: ()
document.querySelector("#chat-input").addEventListener("keyup", (e) => {
    if(e.which == 13) {
        let message = document.querySelector("#chat-input").value

        socket.emit('message_send', {
            author: name,
            content: message
        })

        document.querySelector("#chat-input").value = ""
        e.preventDefault()
    }
})

socket.on('message', data => {
    document.querySelector(".chat").innerHTML += `<strong style="color: gray;">${data.author}</strong> ${data.content}`
})

/* Building a buildings XD */
document.querySelectorAll(".col-build").forEach(div => {
    div.addEventListener("click", () => {
        socket.emit('CITY_BUILD_BUILDING', {
            CityMayor: name,
            BuildingName: div.dataset.building
        })
    })
})

socket.on('PLAYER_CITY_BUILDINGS_ALL', cities => {
    cities.forEach(city => {
        if(city.CityMayor != name) return;
        console.log(city, "a")

        const buildingContainer = document.querySelector("#buildings-container")
        buildingContainer.innerHTML = ""

        city.buildings.forEach(building => {
            buildingContainer.innerHTML += `
                <div class="building-row flex flex-wrap-center" style="margin: 10px 0;">
                    <img src="icons/${building.icon}" alt="" class="building-image icon96x96">
                    <span class="header-building-name bold">
                        ${building.name}
                    </span>
                    <div class="statisticsof-build col6">
                        <span class="inline-flex flex-wrap-center hei24 margin10" data-tooltip="Building farms wood per round"><em class="fas fa-tree fas-right"></em> ${building.WoodPerRound}</span>
                        <span class="inline-flex flex-wrap-center hei24 margin10" data-tooltip="Building farms stone per round" data-tooltipBackground="#777"><img src="icons/rock.png" alt="" class="icon24"> ${building.StonePerRound}</span>
                        <span class="inline-flex flex-wrap-center hei24 margin10" data-tooltip="Building farms metal per round" data-tooltipBackground="#444"><img src="icons/metal.png" alt="" class="icon24"> ${building.MetalPerRound}</span>
                        <span class="inline-flex flex-wrap-center hei24 margin10" data-tooltip="Building farms food per round" data-tooltipBackground="brown"><em class="fas fa-drumstick-bite fas-right"></em> ${building.produceFoodPerRound}</span>
                    </div>
                    <div class="build-upgrade">
                        <button class="upgrade-building" data-name="${building.name}" data-tooltip-big="<b>Upgrade to level</b>: ${building.upgradeLevel + 1} <br> <b>Price</b>: ${(building.price * building.upgradeLevel) * 1.4} <em class='fas fa-coins'></em>" data-tooltipBackground="rgb(59, 53, 47)" data-tooltip-height="40" data-tooltip-width="200">
                            <img src="icons/upgrade.png" alt="" class="icon36">
                        </button>
                        <span class="level">${building.upgradeLevel}</span>
                    </div>
                </div> 
            `
        })

        document.querySelectorAll(".upgrade-building").forEach(btn => {
            btn.addEventListener("click", () => {
                socket.emit('UPGRADE_BUILDING', {
                    CityMayor: name,
                    BuildingName: btn.dataset.name
                })
            })
        })
    
        appendTooltip()

    })
})

socket.on('PLAYER_CITY_BUILDINGS', city => {
    const buildingContainer = document.querySelector("#buildings-container")
    buildingContainer.innerHTML = ""

    city.buildings.forEach(building => {
        buildingContainer.innerHTML += `
            <div class="building-row flex flex-wrap-center" style="margin: 10px 0;">
                <img src="icons/${building.icon}" alt="" class="building-image icon96x96">
                <span class="header-building-name bold">
                    ${building.name}
                </span>
                <div class="statisticsof-build col6">
                    <span class="inline-flex flex-wrap-center hei24 margin10" data-tooltip="Building farms wood per round"><em class="fas fa-tree fas-right"></em> ${building.WoodPerRound}</span>
                    <span class="inline-flex flex-wrap-center hei24 margin10" data-tooltip="Building farms stone per round" data-tooltipBackground="#777"><img src="icons/rock.png" alt="" class="icon24"> ${building.StonePerRound}</span>
                    <span class="inline-flex flex-wrap-center hei24 margin10" data-tooltip="Building farms metal per round" data-tooltipBackground="#444"><img src="icons/metal.png" alt="" class="icon24"> ${building.MetalPerRound}</span>
                    <span class="inline-flex flex-wrap-center hei24 margin10" data-tooltip="Building farms food per round" data-tooltipBackground="brown"><em class="fas fa-drumstick-bite fas-right"></em> ${building.produceFoodPerRound}</span>
                </div>
                <div class="build-upgrade">
                    <button class="upgrade-building" data-name="${building.name}" data-tooltip-big="<b>Upgrade to level</b>: ${building.upgradeLevel + 1} <br> <b>Price</b>: ${(building.price * building.upgradeLevel) * 1.4} <em class='fas fa-coins'></em>" data-tooltipBackground="rgb(59, 53, 47)" data-tooltip-height="40" data-tooltip-width="200">
                        <img src="icons/upgrade.png" alt="" class="icon36">
                    </button>
                    <span class="level">${building.upgradeLevel}</span>
                </div>
            </div> 
        `
    })

    document.querySelectorAll(".upgrade-building").forEach(btn => {
        btn.addEventListener("click", () => {
            socket.emit('UPGRADE_BUILDING', {
                CityMayor: name,
                BuildingName: btn.dataset.name
            })
        })
    })

    appendTooltip()
})

appendTooltip()

/* DOMContentLoaded */

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".upgrade-building").forEach(btn => {
            btn.addEventListener("click", () => {
                socket.emit('UPGRADE_BUILDING', {
                    CityMayor: name,
                    BuildingName: btn.dataset.name
                })
            })
        })
    })

/* DOMContentLoaded END */

/* Simple City Enlarging */

    document.querySelector(".enlarge-city")
    .addEventListener("click", () => {
        socket.emit('ENLARGE_CITY', {
            CityMayor: name
        })
    })

/* End */

/* Recruiting Troops */
    function calcTroops () {
        /**
         *
         * @var troops = number of troops to recruit
         * @var price = troops * 100 
         * 
         * 100 is price per every troop
         *   
         */
        const troops = document.querySelector("#how-many-to-recruit").value
        const price = troops * 100 
        document.querySelector("#price-of-recruit").innerHTML = price
    }
    
    document.querySelector("#recruit-btn").addEventListener("click", () => {
        // RECRUIT
        const troops = document.querySelector("#how-many-to-recruit").value
        const price = troops * 100 
        socket.emit("RECRUIT_ARMY", {
            CityMayor: name,
            Troops: troops
        })
    })

    document.querySelector("#how-many-to-recruit").addEventListener("change", calcTroops)
    document.querySelector("#how-many-to-recruit").addEventListener("input", calcTroops)
    document.querySelector("#how-many-to-recruit").addEventListener("keyup", calcTroops)
/* END */

/* City Interactions */
let time_city_created = 0
    setTimeout(() => {
        if(cities.length == 0) {
            document.querySelector("#other-cities").innerHTML = `<span class="text-no-other-cities">There is no other cities!</span>`
            return;
        }
        cities.forEach(city => {
            if(city.CityMayor == name) return;
            document.querySelector("#other-cities").innerHTML = `
                <b>${city.CityName}</b> <button class="fas fa-shield-alt make-war btn-inv" data-tooltip="${city.CityMayor}" title="Make war"></button>
            `
            update_event_war()
        })
    }, 1001)
    socket.on('CITY_CREATED_NEW', city => {
        if(city.CityMayor == name) return;
        if(time_city_created == 0)document.querySelector("#other-cities").innerHTML = '' 
            document.querySelector("#other-cities").innerHTML += `
                <b>${city.CityName}</b> <button class="fas fa-shield-alt make-war btn-inv" data-citymayor="${city.CityMayor}" title="Make war"></button>
            `
            update_event_war()

            time_city_created++
    })
/* END */

function update_event_war() {
    //
    document.querySelectorAll(".make-war").forEach(btn => {
        btn.addEventListener("click", () => {
            socket.emit("BATTLE_START", {to: btn.dataset.citymayor, from: name})
        })
    })
    
}
/* NOTIFICATIONS */

let currentNotifications = 0

socket.on('NOTIFICATION', data => {
    /**
     * 
     * @object data contains
     * @var icon: string
     * @var color: string 
     * @var text: string
     * 
     */

     currentNotifications++
        
    const Notification = document.createElement("div")
    document.body.appendChild(Notification)

    Notification.style.bottom = (40 + (currentNotifications * 60)) + 'px'

    Notification.innerHTML = `
        <span class="_notification_description"> ${data.text} </span>
        <div class="_1x1-full-icon" style="background: ${data.color};">
            <em class="${data.icon}"></em>
        </div>
    `

    Notification.classList.add("notification")
    setTimeout(() => {
        Notification.remove()
        currentNotifications--

        const Nots = document.querySelectorAll(".notification")
        Nots.forEach(Notif => {
            let bottom = parseInt(Notif.style.bottom.split("px")[0]) - 60
            Notif.style.bottom = bottom + 'px'
        })
    }, 1500)
})

/* END */

/* Mobs spawning */
    socket.on('MOB_UPDATE', data => {
        mobs = data
        renderMobs()
    })

    function renderMobs() {
        mobs.forEach(mob => {
            renderer.renderImage(mob.x * ScaleX - offsetX * ScaleX, mob.y * ScaleY - offsetY * ScaleY, 2.5 * ScaleX, 2.5 * ScaleY, mob.image)
        })
    }
/* END */