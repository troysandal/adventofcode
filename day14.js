/*
--- Day 14: Space Stoichiometry ---
As you approach the rings of Saturn, your ship's low fuel indicator turns on.
There isn't any fuel here, but the rings have plenty of raw material. Perhaps
your ship's Inter-Stellar Refinery Union brand nanofactory can turn these raw
materials into fuel.

You ask the nanofactory to produce a list of the reactions it can perform that
are relevant to this process (your puzzle input). Every reaction turns some
quantities of specific input chemicals into some quantity of an output chemical.
Almost every chemical is produced by exactly one reaction; the only exception,
ORE, is the raw material input to the entire process and is not produced by a
reaction.

You just need to know how much ORE you'll need to collect before you can produce
one unit of FUEL.

Each reaction gives specific quantities for its inputs and output; reactions
cannot be partially run, so only whole integer multiples of these quantities
can be used. (It's okay to have leftover chemicals when you're done, though.)
For example, the reaction 1 A, 2 B, 3 C => 2 D means that exactly 2 units of
chemical D can be produced by consuming exactly 1 A, 2 B and 3 C. You can run
the full reaction as many times as necessary; for example, you could produce 10
D by consuming 5 A, 10 B, and 15 C.
*/
import {assert} from './util.js'
// const assert = console.assert

function bake(map, recipe, qty, ingredients = {}, leftovers = {}) {    
    leftovers[recipe.name] = leftovers[recipe.name] || 0
    if (leftovers[recipe.name] >= qty) {
        leftovers[recipe.name] -= qty
    } else {
        // We have to bake more cookies in a minimum batch size of recipe.increment.  
        const batches = Math.ceil((qty - leftovers[recipe.name]) / recipe.increment)
        const batchSize = recipe.increment * batches
        // Add any leftovers first
        leftovers[recipe.name] += (batchSize - qty)
        ingredients[recipe.name] = (ingredients[recipe.name] || 0) + qty
        for (let ingredient of recipe.ingredients) {
            if (ingredient.recipe.name === "ORE") {
                ingredients['ORE'] = (ingredients['ORE'] || 0) + ingredient.qty * batches
            } else {
                bake(map, ingredient.recipe, ingredient.qty * batches, ingredients, leftovers)
            }
        }
    }
    return ingredients
}

function bakeIterative(map, r, q, ingredients = {}, leftovers = {}) {
    let list1 = [{recipe:r, qty:q}]
    do {
        let {recipe, qty} = list1.shift()
        leftovers[recipe.name] = leftovers[recipe.name] || 0

        if (leftovers[recipe.name] >= qty) {
            leftovers[recipe.name] -= qty
            ingredients[recipe.name] = (ingredients[recipe.name]||0) + qty
        } else {
            // We have to bake more cookies in a minimum batch size of recipe.increment.  
            const batches = Math.ceil((qty - leftovers[recipe.name]) / recipe.increment)
            const batchSize = recipe.increment * batches
            // Add any leftovers first
            leftovers[recipe.name] += (batchSize - qty)
            ingredients[recipe.name] = (ingredients[recipe.name]||0) + qty
            for (let ingredient of recipe.ingredients) {
                if (ingredient.recipe.name === "ORE") {
                    ingredients['ORE'] = (ingredients['ORE'] || 0) + batches*ingredient.qty
                } else {
                    list1.push({recipe:ingredient.recipe, qty:ingredient.qty * batches})
                }
            }
        }
    } while (list1.length)
    return ingredients
}

function parseRecipes(input) {
    const recipes = { 'ORE': { name: 'ORE' } }
    input.split('\n')
        // Ignore empty lines
        .map((v) => v.trim())
        .filter((v) => v.length)
        // Comma delimter everything
        .map((v) => v.replace('=>', ','))
        // Turn [ing1, ing2, result] into [{recipe:, qty}, ...]
        .map((v) => {
            return v.split(',')
                .map((v) => v.trim().split(' '))
                .map((v) => ({ recipe: v[1], qty: parseInt(v[0]) }))
        })
        // Turn [{recipe:, increment}, ...] into [{result.name, increment, recipe:[ing1, ing2]}]
        .map((v) => {
            const last = v[v.length - 1]
            const recipe = {
                name: last.recipe,
                increment: last.qty,
                ingredients: v.slice(0, v.length - 1)
            }

            assert(!recipes[recipe.name], `Ingredient ${recipe.name} already in tree!`)
            recipes[recipe.name] = recipe
            return recipe
        })
        // Turn into tree
        .forEach((recipe) => {
            recipe.ingredients.forEach((ingredient) => {
                ingredient.recipe = recipes[ingredient.recipe]
            })
        })
    return recipes
}

function test(recipesText, expected, recipeName = 'FUEL', qty = 1) {
    const recipes = parseRecipes(recipesText)
    const recipesTextSaved = Object
        .values(recipes)
        .filter((v) => v.name !== "ORE")
        .map(printRecipe).join('\n')
    const recipes2 = parseRecipes(recipesTextSaved)
    assert(JSON.stringify(recipes) === JSON.stringify(recipes2), 'Recipe Persistence is Borked')
    
    const algols = [bake, bakeIterative]
    const ingredients = algols.map((algol) => algol(recipes, recipes[recipeName], qty))
    const actuals = ingredients.map((list) => list['ORE'])
    const allMatch = actuals.every((actual) => actual===expected)
    const results = actuals.map((actual) => `:${actual} ${actual===expected?'=':'!'}== ${expected}`)
    assert(allMatch, `[${results.join(', ')}]`)
}

function printRecipe(recipe) {
    if (!recipe.ingredients) { return '' }
    const left = recipe.ingredients.map((ingredient) => `${ingredient.qty} ${ingredient.recipe.name}`).join(', ')
    const right = `${recipe.increment} ${recipe.name}`
    return `${left} => ${right}`
}

(() => {
    // This is what tripped me up for ever, if I'd just had this simple case early 
    // on I would have saved lots of time. 
    test(`1 ORE => 5 A
        6 A, 6 A => 1 FUEL`,
        3
    )

    test(`1 ORE => 1 A
        1 A => 6 FUEL`,
        1, 'FUEL', 1
    )
    test(`1 ORE => 1 A
        1 A => 6 FUEL`,
        1, 'FUEL', 6
    )
    test(`1 ORE => 1 A
        1 A => 6 FUEL`,
        2, 'FUEL', 7
    )
    // Suppose your nanofactory produces the following list of reactions:
    test(`10 ORE => 10 A
        1 ORE => 1 B
        7 A, 1 B => 1 C
        7 A, 1 C => 1 D
        7 A, 1 D => 1 E
        7 A, 1 E => 1 FUEL`
        , 31)


    /*
    The first two reactions use only ORE as inputs; they indicate that you can
    produce as much of chemical A as you want (in increments of 10 units, each
    10 costing 10 ORE) and as much of chemical B as you want (each costing 1
    ORE). To produce 1 FUEL, a total of 31 ORE is required: 1 ORE to produce
    1 B, then 30 more ORE to produce the 7 + 7 + 7 + 7 = 28 A (with 2 extra
    A wasted) required in the reactions to convert the B into C, C into D, D into
    E, and finally E into FUEL. (30 A  is produced because its reaction requires
    that it is created in increments of 10.)

    Or, suppose you have the following list of reactions:

      Consume 45 ORE to produce 10->10 A.
      Consume 64 ORE to produce 23->24 B.
      Consume 56 ORE to produce 37->40 C.
      Consume 6 A, 8 B to produce 2 AB.
      Consume 15 B, 21 C to produce 3 BC.
      Consume 16 C, 4 A to produce 4 CA.
      Consume 2 AB, 3 BC, 4 CA to produce 1 FUEL.

      The below list of reactions requires 165 ORE to produce 1 FUEL:
    */
   test(
        `9 ORE => 2 A
        8 ORE => 3 B
        7 ORE => 5 C
        3 A, 4 B => 1 AB
        5 B, 7 C => 1 BC
        4 C, 1 A => 1 CA
        2 AB, 3 BC, 4 CA => 1 FUEL`,
        165
    )

    test(`9 ORE => 2 A
        8 ORE => 3 B
        7 ORE => 5 C
        3 A, 4 B => 1 AB
        5 B, 7 C => 1 BC
        4 C, 1 A => 4 CA
        2 AB, 3 BC, 4 CA => 1 FUEL`
        , 135)
    
    // Here are some larger examples:
    test(`157 ORE => 5 NZVS
        165 ORE => 6 DCFZ
        44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
        12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
        179 ORE => 7 PSHF
        177 ORE => 5 HKGWZ
        7 DCFZ, 7 PSHF => 2 XJWVT
        165 ORE => 2 GPVTF
        3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT`
        , 13312)

    test(`2 VPVL, 7 FWMGM, 2 CXFTF, 11 MNCFX => 1 STKFG
        17 NVRVD, 3 JNWZP => 8 VPVL
        53 STKFG, 6 MNCFX, 46 VJHF, 81 HVMC, 68 CXFTF, 25 GNMV => 1 FUEL
        22 VJHF, 37 MNCFX => 5 FWMGM
        139 ORE => 4 NVRVD
        144 ORE => 7 JNWZP
        5 MNCFX, 7 RFSQX, 2 FWMGM, 2 VPVL, 19 CXFTF => 3 HVMC
        5 VJHF, 7 MNCFX, 9 VPVL, 37 CXFTF => 6 GNMV
        145 ORE => 6 MNCFX
        1 NVRVD => 8 CXFTF
        1 VJHF, 6 MNCFX => 4 RFSQX
        176 ORE => 6 VJHF`
        , 180697)

    test(`171 ORE => 8 CNZTR
        7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL
        114 ORE => 4 BHXH
        14 VRPVC => 6 BMBT
        6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL
        6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT
        15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW
        13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW
        5 BMBT => 4 WPTQ
        189 ORE => 9 KTJDG
        1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP
        12 VRPVC, 27 CNZTR => 2 XDBXC
        15 KTJDG, 12 BHXH => 5 XCVML
        3 BHXH, 2 VRPVC => 7 MZWV
        121 ORE => 7 VRPVC
        7 XCVML => 6 RJRHP
        5 BHXH, 4 VRPVC => 5 LTCX`
        , 2210736)
})();

/*
  Given the list of reactions in your puzzle input, what is the minimum amount of ORE required to produce exactly 1 FUEL?
*/

const puzzleInput = `
    2 MLVWS, 8 LJNWK => 1 TNFQ
    1 BWXQJ => 2 BMWK
    1 JMGP, 3 WMJW => 9 JQCF
    8 BWXQJ, 10 BJWR => 6 QWSLS
    3 PLSH, 1 TNFQ => 6 CTPTW
    11 GQDJG, 5 BMWK, 1 FZCK => 7 RQCNC
    1 VWSRH => 7 PTGXM
    104 ORE => 7 VWSRH
    1 PTGXM, 13 WMJW, 1 BJGD => 7 KDHF
    12 QWSLS, 3 PLSH, 4 HFBPX, 2 DFTH, 11 BCTRK, 4 JPKWB, 4 MKMRC, 3 XQJZQ => 6 BDJK
    1 JQCF, 3 CVSC => 2 KRQHC
    128 ORE => 7 QLRXZ
    32 CXLWB, 18 TZWD => 1 HFQBG
    31 KDHF => 9 BWXQJ
    21 MLVWS => 9 LJNWK
    3 QLRXZ => 5 CXLWB
    3 LQWDR, 2 WSDH, 5 JPKWB, 1 RSTQC, 2 BJWR, 1 ZFNR, 16 QWSLS => 4 JTDT
    3 BWXQJ, 14 JMGP => 9 MSTS
    1 KXMKM, 2 LFCR => 9 DKWLT
    6 CVSC => 3 FWQVP
    6 XBVH, 1 HFBPX, 2 FZCK => 9 DFTH
    9 MSTS => 2 BCTRK
    1 PLSH, 28 MSTS => 2 FDKZ
    10 XBVH, 5 BJWR, 2 FWQVP => 6 ZFNR
    2 CVSC => 6 XBVH
    1 BWXQJ, 2 KXMKM => 3 XQJZQ
    1 VWSRH, 1 TZWD => 4 WMJW
    14 CTPTW, 19 JMGP => 8 GRWK
    13 NLGS, 1 PTGXM, 3 HFQBG => 5 BLVK
    2 PTGXM => 7 NLGS
    123 ORE => 3 DLPZ
    2 ZNRPX, 35 DKWLT => 3 WSDH
    1 TZWD, 1 BLVK, 9 BWXQJ => 2 MKDQF
    2 DLPZ => 2 MLVWS
    8 MKDQF, 4 JQCF, 12 VLMQJ => 8 VKCL
    1 KRQHC => 7 BJWR
    1 GRWK, 2 FWQVP => 9 LFCR
    2 MSTS => 2 GQDJG
    132 ORE => 9 TZWD
    1 FWQVP => 8 RHKZW
    43 FDKZ, 11 BJWR, 63 RHKZW, 4 PJCZB, 1 BDJK, 13 RQCNC, 8 JTDT, 3 DKWLT, 13 JPKWB => 1 FUEL
    1 LFCR, 5 DFTH => 1 RSTQC
    10 GQDJG => 8 KPTF
    4 BWXQJ, 1 MKDQF => 7 JMGP
    10 FGNPM, 23 DFTH, 2 CXLWB, 6 KPTF, 3 DKWLT, 10 MKDQF, 1 MJSG, 6 RSTQC => 8 PJCZB
    8 VWSRH, 1 DLPZ => 7 BJGD
    2 BLVK => 9 HBKH
    16 LQWDR, 3 MSTS => 9 HFBPX
    1 TNFQ, 29 HFQBG, 4 BLVK => 2 KXMKM
    11 CVSC => 8 MJSG
    3 LFCR => 6 FGNPM
    11 HFQBG, 13 MKDQF => 1 FZCK
    11 BWXQJ, 1 QLRXZ, 1 TNFQ => 9 KBTWZ
    7 XQJZQ, 6 VKCL => 7 LQWDR
    1 LJNWK, 4 HBKH => 1 CVSC
    4 PLSH, 2 WSDH, 2 KPTF => 5 JPKWB
    1 KPTF => 8 MKMRC
    5 NLGS, 2 KDHF, 1 KBTWZ => 2 VLMQJ
    4 MLVWS, 1 WMJW, 8 LJNWK => 1 PLSH
    3 VKCL => 7 ZNRPX`


// 1st Try: 1378997 IS TOO HIGH
// 2nd Try: 2067368 IS TOO HIGH
// 3rd Try: 1046184
test(puzzleInput, 1046184)
console.log(`Part 1 Answer is 1046184`)
console.log('Part 1 DONE');



/*
--- Part Two ---
After collecting ORE for a while, you check your cargo hold: 1 trillion (1000000000000) units of ORE.

With that much ore, given the examples below:
*/
(() => {
    function findRange(recipes, startAt = 1, maxORE = 1000000000000) {
        let increment = 0
        let fuelQty
        while (true) {
            fuelQty = (startAt-1) + 2**increment
            const oreUsed = bake(recipes, recipes['FUEL'], fuelQty)['ORE']
            // console.log(`Got ${fuelQty} FUEL from ${ore} ORE`)
            if (oreUsed > maxORE) {
                // console.log(`Look between ${fuelQty} and ${fuelQty/2}`)
                return [fuelQty/2, fuelQty]
            }
            increment++
        }    
    }
    
    function binarySearch(low, high, compare) {
        let midPoint
        
        while ((high - low) > 1) {
            midPoint = low + Math.floor((high - low) / 2)
            assert(midPoint >= low && midPoint <= high)
            assert(high >= low)
            switch(Math.sign(compare(midPoint))) {
                case 1: high = midPoint; break;
                case 0: return midPoint;
                case -1: low = midPoint; break;
            }
            assert(high >= low)
        }
        return low
    };
    
    (() => {
        assert(10 === binarySearch(10, 20, (v) => v - 10), 'bleck')
        const input = ['binary', 'search', 'zoo', 'printer', 'bleck'].sort()
        assert(0 === binarySearch(0, input.length, (word) => input[word].localeCompare('binary')))
        assert((input.length-1) === binarySearch(0, input.length, (word) => input[word].localeCompare('zoo')))
        assert(0 === binarySearch(0, input.length, (word) => input[word].localeCompare('barry')))
    })();

    function test2(recipesText, expected) {        
        const recipes = parseRecipes(recipesText)    
        const oneTrillionOre = 1000000000000
        let fuelRange = findRange(recipes)
        const maxFuelProduced = binarySearch(
            fuelRange[0], 
            fuelRange[1],
            (fuel) => bake(recipes, recipes['FUEL'], fuel)['ORE'] - oneTrillionOre)
        let ore = bake(recipes, recipes['FUEL'], fuelRange[0])['ORE']
        assert(ore <= oneTrillionOre, 'ore !<= 1Trillion')
        assert(maxFuelProduced === expected, `${expected} != ${maxFuelProduced}`)
    }

    // The 13312 ORE-per-FUEL example could produce 82892753 FUEL.
    test2(`157 ORE => 5 NZVS
        165 ORE => 6 DCFZ
        44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
        12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
        179 ORE => 7 PSHF
        177 ORE => 5 HKGWZ
        7 DCFZ, 7 PSHF => 2 XJWVT
        165 ORE => 2 GPVTF
        3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT`
        , 82892753)

    // The 180697 ORE-per-FUEL example could produce 5586022 FUEL.
    test2(`2 VPVL, 7 FWMGM, 2 CXFTF, 11 MNCFX => 1 STKFG
        17 NVRVD, 3 JNWZP => 8 VPVL
        53 STKFG, 6 MNCFX, 46 VJHF, 81 HVMC, 68 CXFTF, 25 GNMV => 1 FUEL
        22 VJHF, 37 MNCFX => 5 FWMGM
        139 ORE => 4 NVRVD
        144 ORE => 7 JNWZP
        5 MNCFX, 7 RFSQX, 2 FWMGM, 2 VPVL, 19 CXFTF => 3 HVMC
        5 VJHF, 7 MNCFX, 9 VPVL, 37 CXFTF => 6 GNMV
        145 ORE => 6 MNCFX
        1 NVRVD => 8 CXFTF
        1 VJHF, 6 MNCFX => 4 RFSQX
        176 ORE => 6 VJHF`
        , 5586022)

    // The 2210736 ORE-per-FUEL example could produce 460664 FUEL.
    test2(`171 ORE => 8 CNZTR
        7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL
        114 ORE => 4 BHXH
        14 VRPVC => 6 BMBT
        6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL
        6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT
        15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW
        13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW
        5 BMBT => 4 WPTQ
        189 ORE => 9 KTJDG
        1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP
        12 VRPVC, 27 CNZTR => 2 XDBXC
        15 KTJDG, 12 BHXH => 5 XCVML
        3 BHXH, 2 VRPVC => 7 MZWV
        121 ORE => 7 VRPVC
        7 XCVML => 6 RJRHP
        5 BHXH, 4 VRPVC => 5 LTCX`
        , 460664
    )
    /*
        With that much ore, given the examples above:

        The 13312 ORE-per-FUEL example could produce  82892753 FUEL.
        The 180697 ORE-per-FUEL example could produce  5586022 FUEL.
        The 2210736 ORE-per-FUEL example could produce  460664 FUEL.
        The 1046184 ORE-per-FUEL example could produce 1639374 FUEL

        (82892753-1000000000000/13312)/82892753  = 0.093
        ( 5586022-1000000000000/180697)/5586022  = 0.009
        (  460664-1000000000000/2210736)/460664  = 0.018
        ( 1639374-1000000000000/1046184)/1639374 = 0.41
    */
    test2(puzzleInput, 1639374);


    // Given 1 trillion ORE, what is the maximum amount of FUEL you can produce?

    console.log(`Part 2 Answer is 1639374`)
    console.log('Part 2 DONE');
})();
