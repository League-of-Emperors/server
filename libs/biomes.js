const SimplexNoise = require("simplex-noise")
const simplex = new SimplexNoise()

module.exports = {
    getBiomeByCoordinates(seed, x, y, height) {

        const
            mossiness = Math.abs(simplex.noise4D(x, y, seed, x * y)) % 1,
            driness = Math.abs(simplex.noise4D(x, y, seed, y / x)) % 1,
            temperature = Math.abs(simplex.noise4D(x, y, seed, y * x) * 60)  % 60

        if(height <= 34) {
            return 3 // OCEAN
        }

        else if(height >= 98) {
            return 5 // Mountains
        }

        if(mossiness < .6 && mossiness > .3 && driness > .3) {
            return 0 // PLAINS
        }

        else if(mossiness < .2 && driness > .7) {
            return 1 // DESERT
        }

        else if(mossiness < .65 && mossiness > .1 && driness < .4) {
            return 2 // FOREST
        }
        
        else if(mossiness > .7) {
            return 3 // OCEAN
        } 
        
        else if(mossiness > .15 && temperature < 12 && temperature > 2) {
            return 4 // TAIGA
        }
        else if(mossiness < .2 && temperature < 2) {
            return 6 // TUNDRA
        }

        else {
            return 0
        }

        return parseInt(Math.abs(simplex.noise2D(x * seed, y * seed) * 5 * seed)) % 5
    }
}