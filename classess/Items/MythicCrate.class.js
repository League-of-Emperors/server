const Item = require("../Item.class.js")
class MythicCrate extends Item {
    name = 'Mythic Crate'
    isCrate = true
    icon = 'fas fa-box-open'
    crate = {
        drop: [{
            title: '7000',
            icon: 'fas fa-coins',
            addGold: 7000,
            addPeople: 0,
        },
        {
            title: '150',
            icon: 'fas fa-users',
            addGold: 0,
            addPeople: 150,
        },
        {
            title: '100',
            icon: 'fas fa-users',
            addGold: 0,
            addPeople: 100,
        },
        {
            title: '15000',
            icon: 'fas fa-coins',
            addGold: 15000,
            addPeople: 0,
        },{
            title: '30000',
            icon: 'fas fa-coins',
            addGold: 30000,
            addPeople: 0,
        }]
    }

    rarity = .0005
}

module.exports = MythicCrate