import {assert} from '../2019/util.js'

/*
--- Day 3: Toboggan Trajectory ---

With the toboggan login problems resolved, you set off toward the airport. While
travel by toboggan might be easy, it's certainly not safe: there's very minimal
steering and the area is covered in trees. You'll need to see which angles will
take you near the fewest trees.

Due to the local geology, trees in this area only grow on exact integer
coordinates in a grid. You make a map (your puzzle input) of the open squares
(.) and trees (#) you can see. For example:
*/

const part1MapString = `
..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#
`.trim()

console.assert(part1MapString.split('\n').length === 11)

/*
These aren't the only trees, though; due to something you read about once
involving arboreal genetics and biome stability, the same pattern repeats
to the right many times:

..##.........##.........##.........##.........##.........##.......  --->
#...#...#..#...#...#..#...#...#..#...#...#..#...#...#..#...#...#..
.#....#..#..#....#..#..#....#..#..#....#..#..#....#..#..#....#..#.
..#.#...#.#..#.#...#.#..#.#...#.#..#.#...#.#..#.#...#.#..#.#...#.#
.#...##..#..#...##..#..#...##..#..#...##..#..#...##..#..#...##..#.
..#.##.......#.##.......#.##.......#.##.......#.##.......#.##.....  --->
.#.#.#....#.#.#.#....#.#.#.#....#.#.#.#....#.#.#.#....#.#.#.#....#
.#........#.#........#.#........#.#........#.#........#.#........#
#.##...#...#.##...#...#.##...#...#.##...#...#.##...#...#.##...#...
#...##....##...##....##...##....##...##....##...##....##...##....#
.#..#...#.#.#..#...#.#.#..#...#.#.#..#...#.#.#..#...#.#.#..#...#.#  --->

You start on the open square (.) in the top-left corner and need to reach
the bottom (below the bottom-most row on your map).

The toboggan can only follow a few specific slopes (you opted for a cheaper
    model that prefers rational numbers); start by counting all the trees
    you would encounter for the slope right 3, down 1:

From your starting position at the top-left, check the position that is right 3
and down 1. Then, check the position that is right 3 and down 1 from there, and
so on until you go past the bottom of the map.

The locations you'd check in the above example are marked here with O where
there was an open square and X where there was a tree:

..##.........##.........##.........##.........##.........##.......  --->
#..O#...#..#...#...#..#...#...#..#...#...#..#...#...#..#...#...#..
.#....X..#..#....#..#..#....#..#..#....#..#..#....#..#..#....#..#.
..#.#...#O#..#.#...#.#..#.#...#.#..#.#...#.#..#.#...#.#..#.#...#.#
.#...##..#..X...##..#..#...##..#..#...##..#..#...##..#..#...##..#.
..#.##.......#.X#.......#.##.......#.##.......#.##.......#.##.....  --->
.#.#.#....#.#.#.#.O..#.#.#.#....#.#.#.#....#.#.#.#....#.#.#.#....#
.#........#.#........X.#........#.#........#.#........#.#........#
#.##...#...#.##...#...#.X#...#...#.##...#...#.##...#...#.##...#...
#...##....##...##....##...#X....##...##....##...##....##...##....#
.#..#...#.#.#..#...#.#.#..#...X.#.#..#...#.#.#..#...#.#.#..#...#.#  --->

In this example, traversing the map using this slope would cause you to
encounter 7 trees.

Starting at the top-left corner of your map and following a slope of right
3 and down 1, how many trees would you encounter?
*/

// Part 1

function testPart1(runData, expected) {
    const trees = countTreesOnSledRun(runData)
    assert(trees === expected, `Expected ${expected} !== ${trees}`)
    return trees
}

function countTreesOnSledRun(runData) {
    const map = mapStringToMap(runData.mapString)
    const width = map[0].length
    const height = map.length

    let trees = 0
    let x = 0, y = 0

    while (y < height) {
        trees += (map[y][x] === '#' ? 1 : 0)
        x = (x + runData.slope.x) % width
        y = y + runData.slope.y
    }

    return trees
}

function mapStringToMap(mapString) {
    return mapString.split('\n')
}

testPart1({mapString: part1MapString, slope: {x: 3, y: 1}}, 7)

import fs from 'fs'
const PART1_INPUT = 'day3-input.txt'
var puzzleInput

try {
    console.log(process.cwd())
    puzzleInput = fs.readFileSync(PART1_INPUT, 'utf8');
} catch(e) {
    console.log(`Couldn't load ${PART1_INPUT}:`, e.stack);
    process.exit(-1)
}



// 1st try - 259
const part1ExpectedAnswer = 259
const part1Answer = countTreesOnSledRun({mapString: puzzleInput, slope: {x: 3, y: 1}})
console.log(`Part 1 Answer = ${part1Answer}`)
assert(part1ExpectedAnswer === part1Answer, `Part 1 Answer is Broken - Expected ${part1ExpectedAnswer} !== ${part1Answer}`)

// Part 2
/*
Time to check the rest of the slopes - you need to minimize the probability of a
sudden arboreal stop, after all.

Determine the number of trees you would encounter if, for each of the following
slopes, you start at the top-left corner and traverse the map all the way to the
bottom:

Right 1, down 1.
Right 3, down 1. (This is the slope you already checked.)
Right 5, down 1.
Right 7, down 1.
Right 1, down 2.

In the above example, these slopes would find 2, 7, 3, 4, and 2 tree(s)
respectively; multiplied together, these produce the answer 336.

What do you get if you multiply together the number of trees encountered on each
of the listed slopes?
*/

const part2TestSlopes = [
    { slope: {x: 1, y: 1}, expected: 2},
    { slope: {x: 3, y: 1}, expected: 7},
    { slope: {x: 5, y: 1}, expected: 3},
    { slope: {x: 7, y: 1}, expected: 4},
    { slope: {x: 1, y: 2}, expected: 2},
];

function testPart2(mapString, expected) {
    const answers = []

    for (let testData of part2TestSlopes) {
        const answer = testPart1({mapString, slope: testData.slope}, testData.expected)
        answers.push(answer)
    }

    const part2TestAnswer = answers.reduce((prev, cur) => prev*cur)
    console.log(part2TestAnswer === expected)
    return part2TestAnswer
}

testPart2(part1MapString, 336)

function part2() {
    const answers = []

    for (let testData of part2TestSlopes) {
        const trees = countTreesOnSledRun({mapString: puzzleInput, slope: testData.slope})
        answers.push(trees)
    }

    return answers.reduce((prev, cur) => prev*cur)
}


// try 1 : 336 (too low)
// try 2 : 2224913600
const part2ExpectedAnswer = 2224913600
const part2Answer = part2()
console.log(`Part 2 Answer = ${part2Answer}`)
assert(part2ExpectedAnswer === part2Answer, `Part 2 Answer is Broken - Expected ${part2ExpectedAnswer} !== ${part2Answer}`)
