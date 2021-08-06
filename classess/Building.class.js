class Building {
    constructor() {
        this.price = 5000
        this.price_wood = 0
        this.price_stone = 0
        this.price_metal = 0
        this.upgradeLevel = 1
        this.name = 'An untitled building'
        this.produceFoodPerRound = +0
        this.earnsMoneyPerRound = +0
        this.protectsCity = +0  
        this.WoodPerRound = +0
        this.StonePerRound = +0
        this.MetalPerRound = +0
        this.icon = ''
        this.increseMaxGold = 0
        this.increseMaxFood = 0
    }
} // This is an abstaract class

module.exports = Building