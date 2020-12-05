import {assert} from "../2019/util.js"
//const assert = console.assert

/*
--- Day 5: Binary Boarding ---
You board your plane only to discover a new problem: you dropped your boarding
pass! You aren't sure which seat is yours, and all of the flight attendants are
busy with the flood of people that suddenly made it through passport control.

You write a quick program to use your phone's camera to scan all of the nearby
boarding passes (your puzzle input); perhaps you can find your seat through
process of elimination.

Instead of zones or groups, this airline uses BINARY SPACE PARTITIONING to seat
people. A seat might be specified like FBFBBFFRLR, where F means "front", B
means "back", L means "left", and R means "right".

The first 7 characters will either be F or B; these specify exactly one of the
128 ROWS on the plane (numbered 0 through 127). Each letter tells you which
half of a region the given seat is in. Start with the whole list of rows; the
first letter indicates whether the seat is in the front (0 through 63) or the
back (64 through 127). The next letter indicates which half of that region the
seat is in, and so on until you're left with exactly one row.

For example, consider just the first seven characters of FBFBBFFRLR:

- Start by considering the whole range, rows 0 through 127.
- F means to take the LOWER HALF, keeping rows 0 through 63.
- B means to take the UPPER HALF, keeping rows 32 through 63.
- F means to take the LOWER HALF, keeping rows 32 through 47.
- B means to take the UPPER HALF, keeping rows 40 through 47.
- B keeps rows 44 through 47.
- F keeps rows 44 through 45.
- The final F keeps the lower of the two, row 44.

The last three characters will be either L or R; these specify exactly one of
the 8 COLUMNS of seats on the plane (numbered 0 through 7). The same process
as above proceeds again, this time with only three steps. L means to keep the
lower half, while R means to keep the upper half.

For example, consider just the last 3 characters of FBFBBFFRLR:

- Start by considering the whole range, columns 0 through 7.
- R means to take the upper half, keeping columns 4 through 7.
- L means to take the lower half, keeping columns 4 through 5.
- The final R keeps the upper of the two, column 5.

So, decoding FBFBBFFRLR reveals that it is the seat at row 44, column 5.

Every seat also has a unique seat ID: multiply the row by 8, then add the
column. In this example, the seat has ID 44 * 8 + 5 = 357.

Here are some other boarding passes:
*/


const part1Examples = [
    { seatCode: 'BFFFBBFRRR', expected: {row: 70, column: 7, seatID: 567} },
    { seatCode: 'FFFBBBFRRR', expected: {row: 14, column: 7, seatID: 119} },
    { seatCode: 'BBFFBBFRLL', expected: {row: 102, column: 4, seatID: 820} },
]
/*
As a sanity check, look through your list of boarding passes. What is the
highest seat ID on a boarding pass?
*/

function decordBoardingPass(seatCode) {
    const pass = {
        row: binaryReduce(seatCode.slice(0, 7)),
        column: binaryReduce(seatCode.slice(7)),
        seatID: 0
    }
    pass.seatID = pass.row * 8 + pass.column
    return pass
}

function testPart1() {
    for (let example of part1Examples) {
        const boardingPass = decordBoardingPass(example.seatCode)

        assert(
            example.expected.row === boardingPass.row &&
            example.expected.column === boardingPass.column &&
            example.expected.seatID === boardingPass.seatID,
            `decordBoardingPass(${example.seatCode})\nActual   ${JSON.stringify(boardingPass)}\nExpected ${JSON.stringify(example.expected)}\n`
        )
    }
}

testPart1()



// binaryReduce - given an integer range and a set of halves to choose
// reduce range by choosing halves until range.min == range.max

function binaryReduce(instructions) {
    instructions = normalizeInstructions(instructions)
    const range = Math.pow(2, instructions.length)
    const bounds = [0, range - 1]

    for (let ix = 0; ix < instructions.length; ix++) {
        const half = instructions[ix]
        const width = (bounds[1] - bounds[0]) + 1

        if (half === 'F') {
            bounds[1] = Math.round(bounds[1] - width / 2)
        } else {
            console.assert(half === 'B')
            bounds[0] = Math.round(bounds[0] + width / 2)
        }

    }

    return bounds[0]
}


function testReduce(instructions, expected) {
    const actual = binaryReduce(instructions)
    console.assert(actual === expected, `reduce(${instructions}) ${actual} !== ${expected}`)
}

testReduce('FBFBBFF', 44)
testReduce('RLR', 5)

function normalizeInstructions(instructions) {
    return instructions.replace(/L/gi, 'F').replace(/R/gi, 'B')
}

function testNormalize(instructions, expected) {
    const actual = normalizeInstructions(instructions)
    console.assert(actual === expected, `${actual} !== ${expected}`)
}
testNormalize('RLR', 'BFB')

import fs from 'fs'
const PART1_INPUT = 'day5-input.txt'
var puzzleInput

try {
    console.log(process.cwd())
    puzzleInput = fs.readFileSync(PART1_INPUT, 'utf8');
} catch(e) {
    console.log(`Couldn't load ${PART1_INPUT}:`, e.stack);
    process.exit(-1)
}

const inputs = puzzleInput.split('\n')
let maxSeatID = 0
for (let input of inputs) {
    const pass = decordBoardingPass(input)
    // console.log(`'${JSON.stringify(pass)}'`)
    maxSeatID = Math.max(maxSeatID, pass.seatID)
}

// 1st try - 850
const part1ExpectedAnswer = 850
const part1Answer = maxSeatID
console.log(`Part 1 Answer = ${part1Answer}`)
assert(part1ExpectedAnswer === part1Answer, `Part 1 Answer is Broken - Expected ${part1ExpectedAnswer} !== ${part1Answer}`)
