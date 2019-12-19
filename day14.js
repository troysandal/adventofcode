import {assert} from './util.js'

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
function isTerminal(ingredient) {
    return (ingredient.recipe.length === 1) &&
           ingredient.recipe[0].node.name === "ORE"
  }

// basically a breadth first walk until we hit all the leaf nodes
// {root: {name: 'A', qty:5, recipe[{node:B, qty:7}]}}
function recipeForRecursive(map, root, qty, recipe = {}) {
    const reactions = Math.ceil(qty / root.qty)

    for (let ingredient of root.recipe) {
        if (isTerminal(ingredient.node)) {
            recipe[ingredient.node.name] = (recipe[ingredient.node.name] || 0)
            recipe[ingredient.node.name] += (ingredient.qty * reactions)
        } else {
            recipeFor(map, ingredient.node, ingredient.qty * reactions, recipe)
        }
    }
    return recipe
}
// {root: {name: 'B', qty:3, recipe[{node:ORE, qty:4}]}}
// {root: {name: 'A', qty:5, recipe[{node:B, qty:7}]}}
// {root: {name: 'FUEL', qty:1, recipe[{node:A, qty:2}]}}
function recipeForIterative(map, root, qty, recipe = {}) {
    let reactions
    let list1 = {}, list2
    // {FUEL: 1}
    list1[root.name] = Math.ceil(qty / root.qty)

    while (true) {
        list2 = {}

        for (let ingredientName of Object.keys(list1)) {
            map[ingredientName].recipe.forEach((recipeItem) => {
                const qtyNeeded = recipeItem.qty * list1[ingredientName]
                // reactions = Math.ceil(qtyNeeded / map[recipeItem.node.name].qty)
                const listToUse = isTerminal(recipeItem.node) ? recipe : list2

                listToUse[recipeItem.node.name] = (listToUse[recipeItem.node.name] || 0)
                listToUse[recipeItem.node.name] += qtyNeeded
            })
        }
        list1 = list2

        if (Object.keys(list1).every((v) => isTerminal(map[v]))) {
            break
        }
    }

    // Object.keys(recipe).forEach((key) => {
    //     const roundUp = recipe[key].qty * Math.ceil(recipe[key].qty / map[key].qty)
    //     recipe[key] = roundUp
    // })

    return recipe
}

const recipeFor = recipeForIterative
  //Consume 36=9*(8/2) ORE to produce (7 -> 8 = Math.ceil(7/2)*2) A.
function fuelForRecipe(map, recipe) {
    let totalOre = 0
    for (let name of Object.keys(recipe)) {
        assert(isTerminal(map[name]))
        const ingredient = map[name]
        const qtyDesired = recipe[name]
        const minUnits = Math.ceil(qtyDesired / ingredient.qty)
        const oreNeeded = minUnits * ingredient.recipe[0].qty
        totalOre += oreNeeded
    }
    return totalOre
  }

  function parseInput(input) {
    const ingredients = {'ORE':{name:'ORE'}}
    input.split('\n')
        // Ignore empty lines
        .map((v) => v.trim())
        .filter((v) => v.length)
        // Comma delimter everything
        .map((v) => v.replace('=>', ','))
        // Turn [ing1, ing2, result] into [{node:, qty}, ...]
        .map((v) => {
            return v.split(',')
                .map((v) => v.trim().split(' '))
                .map((v) => ({node:v[1], qty:parseInt(v[0])}))
        })
        // Turn [{node:, qty}, ...] into [{result.name, qty, recipe:[ing1, ing2]}]
        .map((v) => {
            const last = v[v.length - 1]
            const ingredient = {
                name:last.node,
                qty: last.qty,
                recipe: v.slice(0, v.length - 1)
            }

            const ingNames = ingredient.recipe.reduce((p,c) => {
                p[c.node] = (p[c.node]||0) + 1; return p}, {})
            assert(Object.keys(ingNames).length === ingredient.recipe.length)
            assert(!ingredients[ingredient.name], `Ingredient ${ingredient.name} already in tree!`)
            ingredients[ingredient.name] = ingredient
            return ingredient
        })
        // Turn into tree
        .forEach((ingredient) => {
            ingredient.recipe.forEach((v) => {
                v.node = ingredients[v.node]
            })
        })
    return ingredients
  }

  /*

  Suppose your nanofactory produces the following list of reactions:
  */

function test(ingredientsText, expected) {
    const ingredients = parseInput(ingredientsText)
    const recipe = recipeFor(ingredients, ingredients['FUEL'], 1)
    const actual = fuelForRecipe(ingredients, recipe)
    assert(actual === expected, `Actual ${actual} !== Expected ${expected}`)
}

(() => {
    /*
    20 ORE => [14/3]=5 14B
    14B => 2A
    2A => 1 FUEL
    */
    test(`
        4 ORE => 3 B
        7 B => 1 A
        2 A => 1 FUEL`
        ,20)

        /*
    15 ORE => [7/3]=3 7B
    7B => 2A
    2A => 1 FUEL
    */
   test(`
   4 ORE => 3 B
   7 B => 3 A
   2 A => 1 FUEL`
   ,22)
})();

(() => {
test(`10 ORE => 10 A
    1 ORE => 1 B
    7 A, 1 B => 1 C
    7 A, 1 C => 1 D
    7 A, 1 D => 1 E
    7 A, 1 E => 1 FUEL`
    ,31)
})();

  /*
  Crafting recipes
  IDEA: [
    7A, 1E
  ]
   */
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

  */
  (() => {
    test(`9 ORE => 2 A
        8 ORE => 3 B
        7 ORE => 5 C
        3 A, 4 B => 1 AB
        5 B, 7 C => 1 BC
        4 C, 1 A => 1 CA
        2 AB, 3 BC, 4 CA => 1 FUEL`
        ,165)

        /*
          Consume 45 ORE to produce 10->10 A.
          Consume 64 ORE to produce 23->24 B.
          Consume 56 ORE to produce 37->40 C.
          Consume 6 A, 8 B to produce 2 AB.
          Consume 15 B, 21 C to produce 3 BC.
          Consume 16 C, 4 A to produce 4 CA.
          Consume 2 AB, 3 BC, 4 CA to produce 1 FUEL.

          The above list of reactions requires 165 ORE to produce 1 FUEL:
          */
        test(`9 ORE => 2 A
        8 ORE => 3 B
        7 ORE => 5 C
        3 A, 4 B => 1 AB
        5 B, 7 C => 1 BC
        4 C, 1 A => 4 CA
        2 AB, 3 BC, 4 CA => 1 FUEL`
        ,135)
        /*
          Consume 36=9*(8/2) ORE to produce (7 -> 8 = Math.ceil(7/2)*2) A.
          Consume 64=8*(24/3) ORE to produce  (23 --> 24 = Math.ceil(23/3)*3) B
          Consume 35=(7*(25/5)) ORE to produce (25 --> 25 = Math.ceil(25/5)*5) C.
          Consume 6 A, 8 B to produce 2 AB.
          Consume 15 B, 21 C to produce 3 BC.
          Consume 4 C, 1 A to produce 4 CA.
          Consume 2 AB, 3 BC, 4 CA to produce 1 FUEL.

          The above list of reactions requires 165 ORE to produce 1 FUEL:
          */
      })();
  /*


  Here are some larger examples:

  */


(() => {
    test(`157 ORE => 5 NZVS
      165 ORE => 6 DCFZ
      44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
      12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
      179 ORE => 7 PSHF
      177 ORE => 5 HKGWZ
      7 DCFZ, 7 PSHF => 2 XJWVT
      165 ORE => 2 GPVTF
      3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT`
      ,13312)
})();

(() => {
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
})();

(() => {
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
      ,2210736)
  })();

/*

  Given the list of reactions in your puzzle input, what is the minimum amount of ORE required to produce exactly 1 FUEL?
  */