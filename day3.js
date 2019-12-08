// Part 1
const LEVEL = 0
function log(level, message) {
    if (level <= LEVEL) {
        console.log(message)
    }
}
class Grid {
    constructor() {
        this.dimensions = {
            left: 0, top: 0,
            right: 0, bottom: 0
        }
        this.cells = {}
        this.intersections = []
    }
    addWire(wire) {
        let cursor = [0,0]
        let step = 0
        const WIRE_NAME = '' + Math.random()

        for (const operation of wire) {
            const direction = operation[0]
            const distance = parseInt(operation.slice(1))
            const ops = {
                'L': (c) => c[0]--,
                'U': (c) => c[1]++,
                'R': (c) => c[0]++,
                'D': (c) => c[1]--
            }
            const op = ops[direction]
            log(3, `Moving ${distance} to ${direction}`)
            for (let i = 0 ; i < distance ; i++) {
                op(cursor)
                step++
                const cell = this.getCell(cursor) || {}
                cell[WIRE_NAME] = cell[WIRE_NAME] || step
                if (Object.keys(cell).length > 1) {
                    log(1, `intersection at [${cursor}]`)
                    this.intersections.push(cursor.slice(0))
                }
                this.setCell(cursor, cell)
            }
        }
    }
    addWires(wires) {
        for (const wire of wires) {
            this.addWire(wire)
        }
    }
    getCell(address) { 
        return this.cells[`${address[0]},${address[1]}`]
    }
    setCell(address, cell) {
        log(3, `setCell([${address}], ${cell})`)
        this.dimensions.left   = Math.min(address[0], this.dimensions.left)
        this.dimensions.top    = Math.max(address[1], this.dimensions.top)
        this.dimensions.right  = Math.max(address[0], this.dimensions.right)
        this.dimensions.bottom = Math.min(address[1], this.dimensions.bottom)
        this.cells[`${address[0]},${address[1]}`] = cell
    }
    closest() {
        let minDistance = Infinity;
        let minDelay = Infinity;
        for (const address of this.intersections) {
            const manhattanDistance = Math.abs(address[0]) + Math.abs(address[1])
            const cell = this.getCell(address)
            log(0, cell)
            const delay = Object.values(cell).reduce((v, p) => v + p, 0)
            log(0, `delay = ${delay}`)
            log(0, `manhattanDistance([${address}]) = ${manhattanDistance}`)
            minDistance = Math.min(manhattanDistance, minDistance)
            minDelay = Math.min(delay, minDelay)
        }
        return minDistance
    }
    closestDelay() {
        let minDelay = Infinity;
        for (const address of this.intersections) {
            const cell = this.getCell(address)
            log(0, cell)
            const delay = Object.values(cell).reduce((v, p) => v + p, 0)
            log(0, `delay = ${delay}`)
            minDelay = Math.min(delay, minDelay)
        }
        return minDelay
    }
}

// create a grid
//   width, height
//   cells
//   intersections
// draw a wire on grid
//   capture width and height
//   

function test(wires, expected) {
    const grid = new Grid()
    grid.addWires(wires)
    log(3, grid.dimensions)
    const answer = grid.closest()
    console.assert(
        answer === expected,
        `${answer} !== ${expected}`
    )
}

test([[]], Infinity)
test([['R1', 'U1', "D3", 'L4']], Infinity)
test([['R1'], ['R1']], 1)
test([['R2'], ['R1']], 1)

test([['R8','U5','L5','D3'], ['U7','R6','D4','L4']], 6)
test([
        ['R75','D30','R83','U83','L12','D49','R71','U7','L72'],
        ['U62','R66','U55','R34','D71','R55','D58','R83']
    ],
    159)

test([
        ['R98','U47','R26','D63','R33','U87','L62','D20','R33','U53','R51'],
        ['U98','R91','D20','R16','D67','R40','U7','R15','U6','R7']
    ],
    135)

function strToOps(str) {
    return str.split(',')
}

const puzzleInput = 
`R990,U475,L435,D978,L801,D835,L377,D836,L157,D84,R329,D342,R931,D522,L724,U891,L508,U274,L146,U844,R686,D441,R192,U992,L781,D119,R436,D286,R787,D85,L801,U417,R619,D710,R42,U261,R296,U697,L354,D843,R613,U880,R789,D134,R636,D738,L939,D459,L338,D905,R811,D950,L44,U992,R845,U771,L563,D76,L69,U839,L57,D311,L615,D931,L437,D201,L879,D1,R978,U415,R548,D398,L560,D112,L894,D668,L708,D104,R622,D768,R901,D746,L793,D26,R357,U216,L216,D33,L653,U782,R989,U678,L7,D649,R860,D281,L988,U362,L525,U652,R620,D376,L983,U759,R828,D669,L297,U207,R68,U77,R255,U269,L661,U310,L309,D490,L55,U471,R260,D912,R691,D62,L63,D581,L289,D366,L862,D360,L485,U946,R937,D470,L792,D614,R936,D963,R611,D151,R908,D195,R615,U768,L166,D314,R640,U47,L161,U872,R50,U694,L917,D149,L92,U244,L337,U479,R755,U746,L196,D759,L936,U61,L744,D774,R53,U439,L185,D504,R769,D696,L285,D396,R791,U21,L35,D877,L9,U398,R447,U101,R590,U862,L351,D210,L935,U938,R131,U758,R99,U192,L20,U142,L946,D981,R998,U214,R174,U710,L719,D879,L411,U839,L381,U924,L221,D397,R380,U715,R139,D367,R253,D973,L9,U624,L426,D885,R200,U940,R214,D75,R717,D2,R578,U161,R421,U326,L561,U311,L701,U259,R836,D920,R35,D432,R610,D63,R664,D39,L119,D47,L605,D228,L364,D14,L226,D365,R796,D233,R476,U145,L926,D907,R681,U267,R844,U735,L948,U344,L629,U31,L383,U694,L666,U158,R841,D27,L150,D950,L335,U275,L184,D157,R504,D602,R605,D185,L215,D420,R700,U809,L139,D937,L248,U693,L56,U92,L914,U743,R445,U417,L504,U23,R332,U865,R747,D553,R595,U845,R693,U915,R81
L1004,U406,L974,D745,R504,D705,R430,D726,R839,D550,L913,D584,R109,U148,L866,U664,R341,U449,L626,D492,R716,U596,L977,D987,L47,U612,L478,U928,L66,D752,R665,U415,R543,U887,R315,D866,R227,D615,R478,U180,R255,D316,L955,U657,R752,U561,R786,U7,R918,D755,R506,U131,L875,D849,R823,D755,L604,U944,R186,D326,L172,U993,L259,D765,R427,D193,R663,U470,L294,D437,R645,U10,L926,D814,L536,D598,R886,D290,L226,U156,R754,D105,L604,D136,L883,U87,R839,D807,R724,U184,L746,D79,R474,U186,R727,U9,L69,U565,R459,D852,R61,U370,L890,D439,L431,U846,R460,U358,R51,D407,R55,U179,L385,D652,R193,D52,L569,U980,L185,U813,R636,D275,L585,U590,R215,U947,R851,D127,L249,U954,L884,D235,R3,U735,R994,D883,L386,D506,L963,D751,L989,U733,L221,U890,L711,D32,L74,U437,L700,D977,L49,U478,R438,D27,R945,D670,L230,U863,L616,U461,R267,D25,L646,D681,R426,D918,L791,U712,L730,U715,L67,U359,R915,D524,L722,U374,L582,U529,L802,D865,L596,D5,R323,U235,R405,D62,R304,U996,L939,U420,L62,D299,R802,D803,L376,U430,L810,D334,L67,U395,L818,U953,L817,D411,L225,U383,R247,D234,L430,U315,L418,U254,L964,D372,R979,D301,R577,U440,R924,D220,L121,D785,L609,U20,R861,U288,R388,D410,L278,D748,L800,U755,L919,D985,L785,U676,R916,D528,L507,D469,L582,D8,L900,U512,L764,D124,L10,U567,L379,D231,R841,D244,R479,U145,L769,D845,R651,U712,L920,U791,R95,D958,L608,D755,R967,U855,R563,D921,L37,U699,L944,U718,R959,D195,L922,U726,R378,U258,R340,D62,L555,D135,L690,U269,L273,D851,L60,D851,R1,D315,R117,D855,L275,D288,R25,U503,R569,D596,L823,U687,L450`

function partOne() {
    const grid = new Grid()
    const wires = puzzleInput.split('\n').map((v) => v.split(','))
    grid.addWires(wires)
    log(0, `Part One Answer = ${grid.closest()}`)
}

partOne()


// Part 2

function partTwo() {
    const grid = new Grid()
    const wires = puzzleInput.split('\n').map((v) => v.split(','))
    grid.addWires(wires)
    log(0, `Part One Answer = ${grid.closestDelay()}`)
}

partTwo()
