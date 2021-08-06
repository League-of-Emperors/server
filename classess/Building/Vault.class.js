const Building = require("../Building.class.js")
class Vault extends Building {
    price = 65000
    name = 'Vault'
    earnsMoneyPerRound = 0
    protectsCity = +0
    price_metal = 1500
    icon = 'vault.png'
    increseMaxGold = 50000
}

module.exports = Vault