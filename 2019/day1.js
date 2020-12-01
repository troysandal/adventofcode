const modules = [
    50572,
    126330,
    143503,
    136703,
    56987,
    96737,
    140243,
    94427,
    84262,
    149323,
    87398,
    132344,
    72187,
    90878,
    72897,
    101305,
    129483,
    101148,
    66349,
    76719,
    86437,
    84937,
    73911,
    141051,
    61464,
    85350,
    81774,
    129191,
    130129,
    118366,
    125825,
    61781,
    98459,
    69024,
    75886,
    119434,
    108929,
    117387,
    149625,
    79378,
    102582,
    102368,
    117177,
    132105,
    137278,
    149187,
    136653,
    70074,
    115885,
    73901,
    81922,
    133232,
    112929,
    80009,
    116895,
    61248,
    140251,
    98003,
    109610,
    132775,
    55781,
    110809,
    109799,
    125071,
    71734,
    104973,
    75610,
    148974,
    144173,
    89235,
    89438,
    64901,
    142674,
    105446,
    55287,
    64438,
    82269,
    99903,
    97079,
    72708,
    108177,
    130830,
    50393,
    141354,
    123264,
    116302,
    51119,
    127287,
    137515,
    109285,
    110750,
    93770,
    54926,
    57131,
    136897,
    97693,
    135531,
    122858,
    112089,
    98599
]

/*
Fuel required to launch a given module is based on its mass. 
Specifically, to find the fuel required for a module, take its mass, 
divide by three, round down, and subtract 2.
*/

function fuelForMass(mass) {
    return Math.max(0, Math.trunc(mass / 3) - 2)
}

function testFuel(mass, expected) {
    const actual = fuelForMass(mass)
    console.assert(
        actual === expected, 
        `fuelForMass(${mass}) returned ${actual} !== ${expected}`)
}

testFuel(2, 0)
testFuel(12, 2)
testFuel(14, 2)
testFuel(1969, 654)
testFuel(100756, 33583)

function massWithFuel(fuelNeeded) {
    let fuelMass = fuelNeeded
    do {
        fuelMass = fuelForMass(fuelMass)
        fuelNeeded += fuelMass
    } while (fuelMass > 0)
    return fuelNeeded
}

function testMassWithFuel(mass, expected) {
    const fuel = fuelForMass(mass)
    const actual = massWithFuel(fuel)
    console.assert(
        actual === expected, 
        `massWithFuel(${fuel}) returned ${actual} !== ${expected}`)
}

testMassWithFuel(2, 0)
testMassWithFuel(12, 2)
testMassWithFuel(14, 2)
testMassWithFuel(1969, 966)
testMassWithFuel(100756, 50346)

// modules.forEach((mass, index) => console.log(`module ${index} fuelForMass(${mass}) == ${fuelForMass(mass)}`))

const fuelNeeded = modules.reduce((prev, current) => { return prev + fuelForMass(current) }, 0)
// Part 1 Answers
// #1 3,446,248  <--> TOO HIGH
// #2 3,412,531 
console.log(`Fuel Needed = ${fuelNeeded}`)

const fuelAndMass2 = modules.reduce((prev, current) => { 
    const fuel = fuelForMass(current)
    return prev + massWithFuel(fuel)
}, 0)
console.log(`fuelAndMass2 = ${fuelAndMass2}`)
// Part 2 Answers
// #1 5,118,755  <--> Too High
// #2 15,354,216 <--> Way too high
// #3 5115927
