class Item {
    constructor() {
        this.name = ''
        this.isCrate = false
        this.icon = ''
        this.crate = {

        }

        this.id = Math.random() * (2 ** 31)

        this.rarity = 20 // % of chance to drop
    }
} // This is an abstaract class

module.exports = Item