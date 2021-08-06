const Building = require("../Building.class.js")
class Lumbermill extends Building {
    price = 4750
    name = 'Lumbermill'
    WoodPerRound = +30
    earnsMoneyPerRound = +0
    protectsCity = +0
    price_wood = 350
    icon = 'lumbermill.png'
}

module.exports = Lumbermill