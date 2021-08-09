const Item = require("../Item.class.js")
class EpicCrate extends Item {
    name = 'Common Crate'
    isCrate = true
    icon = 'fas fa-box-open'
    crate = {
        drop: [{
            title: '150',
            icon: 'fas fa-coins',
            addGold: 150,
            addPeople: 0,
        },
        {
            title: '5',
            icon: 'fas fa-users',
            addGold: 0,
            addPeople: 5,
        },
        {
            title: '10',
            icon: 'fas fa-users',
            addGold: 0,
            addPeople: 10,
        },
        {
            title: '500',
            icon: 'fas fa-coins',
            addGold: 500,
            addPeople: 0,
        },{
            title: '1000',
            icon: 'fas fa-coins',
            addGold: 1000,
            addPeople: 0,
        }]
    }

    rarity = .75
}

module.exports = EpicCrate