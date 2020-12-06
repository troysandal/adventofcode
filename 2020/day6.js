/*
--- Day 6: Custom Customs ---
As your flight approaches the regional airport where you'll switch to a much
larger plane, customs declaration forms are distributed to the passengers.

The form asks a series of 26 yes-or-no questions marked a through z. All you
need to do is identify the questions for which anyone in your group answers
"yes". Since your group is just you, this doesn't take very long.

However, the person sitting next to you seems to be experiencing a language
barrier and asks if you can help. For each of the people in their group, you
write down the questions for which they answer "yes", one per line. For example:
*/

function unique(answers, map) {
    answers = answers.split('')
    answers.forEach((answer) => {
        map[answer] = map[answer] ? map[answer] + 1 : 1
    })
}

function groupAnswers(group) {
    let count = 0
    const map = {}
    for (let answers of group) {
        count += unique(answers, map)
    }
    return Object.keys(map).length
}

function part1Test(group, expected) {
    const actual = groupAnswers(group)
    console.assert(actual === expected, `${actual} !== ${expected}`)
}

part1Test(['abcx', 'abcy', 'abcz'], 6)

/*
In this group, there are 6 questions to which anyone answered
"yes": a, b, c, x, y, and z. (Duplicate answers to the same question don't
count extra; each question counts at most once.)

Another group asks for your help, then another, and eventually you've
collected answers from every group on the plane (your puzzle input). Each
group's answers are separated by a blank line, and within each group, each
person's answers are on a single line. For example:
*/

const part1Example =
`abc

a
b
c

ab
ac

a
a
a
a

b`.trim()

function parseInput(input) {
    const rows = input.split('\n')
    const groups = []
    let group = []
    groups.push(group)

    for (let row of rows) {
        // console.log(row)
        if (row.length === 0) {
            group = []
            groups.push(group)
        } else {
            group.push(row)
        }
    }
    return groups
}

function sumOfGroups(groups) {
    return groups
        .map((group) => groupAnswers(group))
        .reduce((prev, curr) => prev + curr, 0)
}

console.assert(parseInput(part1Example).length === 5)

/*
This list represents answers from five groups:

The first group contains one person who answered "yes" to 3 questions: a, b, and c.
The second group contains three people; combined, they answered "yes" to 3 questions: a, b, and c.
The third group contains two people; combined, they answered "yes" to 3 questions: a, b, and c.
The fourth group contains four people; combined, they answered "yes" to only 1 question, a.
The last group contains one person who answered "yes" to only 1 question, b.

In this example, the sum of these counts is 3 + 3 + 3 + 1 + 1 = 11.
*/

part1Test(['abc'], 3)
part1Test(['a', 'b', 'c'], 3)
part1Test(['ab', 'ac'], 3)
part1Test(['a', 'a', 'a', 'a'], 1)
part1Test(['b'], 1);

(() => {
    const groups = parseInput(part1Example)
    const actual = sumOfGroups(groups)
    console.assert(actual === 11, `${actual} !== 11`)
})();


/*
For each group, count the number of questions to which anyone answered "yes".
What is the sum of those counts?
*/

import fs from 'fs'
const PART1_INPUT = 'day6-input.txt'
let puzzleInput

try {
    console.log(process.cwd())
    puzzleInput = fs.readFileSync(PART1_INPUT, 'utf8').trim()
} catch(e) {
    console.log(`Couldn't load ${PART1_INPUT}:`, e.stack);
    process.exit(-1)
}

(() => {
    // 1st try - 6170
    const groups = parseInput(puzzleInput)
    const part1ExpectedAnswer = 6170
    const part1Answer = sumOfGroups(groups)
    console.log(`Part 1 Answer = ${part1Answer}`)
    console.assert(part1ExpectedAnswer === part1Answer, `Part 1 Answer is Broken - Expected ${part1ExpectedAnswer} !== ${part1Answer}`)
})();


/*
--- Part Two ---
As you finish the last group's customs declaration, you notice that you misread
one word in the instructions:

You don't need to identify the questions to which anyone answered "yes"; you
need to identify the questions to which everyone answered "yes"!
*/

function uniqueGroupAnswers(group) {
    let count = 0
    const map = {}
    for (let answers of group) {
        count += unique(answers, map)
    }
    return Object.keys(map).reduce((prev, key) => {
        if (map[key] === group.length) {
            return prev + 1
        }
        return prev
    }, 0)
}
function part2Test(group, expected) {
    const actual = uniqueGroupAnswers(group)
    console.assert(actual === expected, `${actual} !== ${expected}`)
}

part2Test(['abcx', 'abcy', 'abcz'], 3)

/*
Using the same example as above:

abc

a
b
c

ab
ac

a
a
a
a

b

*/

part2Test(['abc'], 3)
part2Test(['a', 'b', 'c'], 0)
part2Test(['ab', 'ac'], 1)
part2Test(['a', 'a', 'a', 'a'], 1)
part2Test(['b'], 1);

/*
This list represents answers from five groups:

- In the first group, everyone (all 1 person) answered "yes" to 3
  questions: a, b, and c.
- In the second group, there is no question to which everyone answered "yes".
- In the third group, everyone answered yes to only 1 question, a. Since some
  people did not answer "yes" to b or c, they don't count.
- In the fourth group, everyone answered yes to only 1 question, a.
- In the fifth group, everyone (all 1 person) answered "yes" to 1 question, b.
- In this example, the sum of these counts is 3 + 0 + 1 + 1 + 1 = 6.

For each group, count the number of questions to which everyone answered "yes".
What is the sum of those counts?
*/

function uniqueOfGroups(groups) {
    return groups
        .map((group) => uniqueGroupAnswers(group))
        .reduce((prev, curr) => prev + curr, 0)
}

(() => {
    const groups = parseInput(part1Example)
    const actual = uniqueOfGroups(groups)
    const expected = 6
    console.assert(actual === expected, `${actual} !== ${expected}`)
})();

(() => {
    // 1st try - 2947
    const groups = parseInput(puzzleInput)
    const part2ExpectedAnswer = 2947
    const part2Answer = uniqueOfGroups(groups)
    console.log(`Part 2 Answer = ${part2Answer}`)
    console.assert(part2ExpectedAnswer === part2Answer, `Part 2 Answer is Broken - Expected ${part2ExpectedAnswer} !== ${part2Answer}`)
})();
