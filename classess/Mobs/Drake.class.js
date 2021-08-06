const Mob = require("../Mob.class.js")
class Drake extends Mob {
    hp = 5000
    damage = 10
    groupAttack = false
    rarity = .5 // 0 - 100 (% that mob will spawn somewhere on map in this round)
    loot = 3500
    image = 'assets/drake.jpg'
    color = '#ae34eb'
    name = 'Drake'
}

module.exports = Drake