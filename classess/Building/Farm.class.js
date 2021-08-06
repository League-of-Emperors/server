const Building = require("../Building.class.js")
class Farm extends Building {
    price = 3750
    name = 'Farm'
    produceFoodPerRound = +575
    earnsMoneyPerRound = +0
    protectsCity = +0
    price_wood = 300
    icon = 'farm.png'
}

module.exports = Farm