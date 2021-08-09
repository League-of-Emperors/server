const Mob = require("../Mob.class.js")
class Drake extends Mob {
    hp = 5000
    maxhp = 5000
    damage = 50
    groupAttack = true
    rarity = .05 // 0 - 100 (% that mob will spawn somewhere on map in this round)
    loot = 35000
    image = 'assets/dragon_flame_animation_preview.gif'
    animationFrames = ['assets/drake-flame/dflame1.png', 'assets/drake-flame/dflame2.png', 'assets/drake-flame/dflame3.png', 'assets/drake-flame/dflame4.png', 'assets/drake-flame/dflame5.png', 'assets/drake-flame/dflame6.png', 'assets/drake-flame/dflame5.png', 'assets/drake-flame/dflame6.png', 'assets/drake-flame/dflame5.png', 'assets/drake-flame/dflame6.png', 'assets/drake-flame/dflame7.png', 'assets/drake-flame/dflame8.png', 'assets/drake-flame/dflame9.png'] //['assets/drake-slide-1.png', 'assets/drake-slide-2.png', 'assets/drake-slide-3.png', 'assets/drake-slide-4.png']
    color = '#ae34eb'
    name = 'Drake'
}

module.exports = Drake