const Item = require("../Item.class.js")
class EpicCrate extends Item {
    name = 'Epic Crate'
    isCrate = true
    icon = 'fas fa-box-open'
    crate = {
        drop: [{
            title: '3500',
            icon: 'fas fa-coins',
            addGold: 3500,
            addPeople: 0,
        },
        {
            title: '30',
            icon: 'fas fa-users',
            addGold: 0,
            addPeople: 30,
        },
        {
            title: '50',
            icon: 'fas fa-users',
            addGold: 0,
            addPeople: 50,
        },
        {
            title: '6500',
            icon: 'fas fa-coins',
            addGold: 6500,
            addPeople: 0,
        },{
            title: '1000',
            icon: 'fas fa-coins',
            addGold: 1000,
            addPeople: 0,
        }]
    }

    rarity = .65
}

module.exports = EpicCrate