const Mob = require("../Mob.class.js")
class Chonk extends Mob {
    hp = 1250
    maxhp = 1250
    damage = 30
    groupAttack = false
    rarity = 80  // 0 - 100 (% that mob will spawn somewhere on map in this round)
    loot = 3000
    image = 'assets/chonk_throw_axe.gif'
    animationFrames = ['assets/chonk-slide-1.png','assets/chonk-slide-2.png','assets/chonk-slide-3.png','assets/chonk-slide-4.png']
    color = '#3e6003'
    dieAnimation = ['assets/chonk-die.png', 'assets/chonk-die-2.png', 'assets/chonk-die-3.png', 'assets/chonk-die-4.png']
    name = 'Chonk'
}

module.exports = Chonk