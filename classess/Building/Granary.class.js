const Building = require("../Building.class.js")
class Granary extends Building {
    price = 17500
    name = 'Granary'
    earnsMoneyPerRound = +70
    protectsCity = +0
    price_wood = 1750
    price_stone = 650
    price_metal = 150
    icon = 'Granary.png'
    increseMaxFood = 5000
}

module.exports = Granary