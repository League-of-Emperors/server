const Building = require("../Building.class.js")
class Mine extends Building {
    price = 6300
    name = 'Mine'
    StonePerRound = +25
    MetalPerRound = +7
    earnsMoneyPerRound = +0
    protectsCity = +0
    price_wood = 265
    icon = 'minecart.png'
}

module.exports = Mine