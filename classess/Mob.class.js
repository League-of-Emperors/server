class Mob {
    constructor(x, y) {
        this.hp = 5000
        this.maxhp = 5000
        this.name = ''
        this.damage = 10
        this.groupAttack = false
        this.rarity = 10 // 0 - 100 (% that mob will spawn somewhere on map in this round)
        this.loot = 10000
        this.image = 'assets/drake.jpg'
        this.color = ''

        this.animationFrames = []
        this.dieAnimation = ['']
        this.died = false
        this.dieStep = 0

        this.x = x
        this.y = y
    }
} // This is an abstaract class

module.exports = Mob