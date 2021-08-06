const Building = require("../Building.class.js")
class Market extends Building {
    price = 75000
    name = 'Market'
    earnsMoneyPerRound = +70
    protectsCity = +0
    price_wood = 1530
    price_stone = 780
    icon = 'store.png'
}

module.exports = Market