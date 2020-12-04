import {assert} from '../2019/util.js'

/*
--- Day 4: Passport Processing ---
You arrive at the airport only to realize that you grabbed your North Pole
Credentials instead of your passport. While these documents are extremely
similar, North Pole Credentials aren't issued by a country and therefore aren't
actually valid documentation for travel in most of the world.

It seems like you're not the only one having problems, though; a very long line
has formed for the automatic passport scanners, and the delay could upset your
travel itinerary.

Due to some questionable network security, you realize you might be able to solve
both of these problems at the same time.

The automatic passport scanners are slow because they're having trouble
detecting which passports have all required fields. The expected fields are as
follows:
*/

const passportFields = {
    'byr': { name: 'byr', },
    'iyr': { name: 'iyr', },
    'eyr': { name: 'eyr', },
    'hgt': { name: 'hgt', },
    'hcl': { name: 'hcl', },
    'ecl': { name: 'ecl', },
    'pid': { name: 'pid', },
    'cid': { name: 'cid', optional: true },
}

/*
Passport data is validated in batch files (your puzzle input). Each passport is
represented as a sequence of key:value pairs separated by spaces or newlines.
Passports are separated by blank lines.

Here is an example batch file containing four passports:
*/
const part1Example = `
ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm

iyr:2013 ecl:amb cid:350 eyr:2023 pid:028048884
hcl:#cfa07d byr:1929

hcl:#ae17e1 iyr:2013
eyr:2024
ecl:brn pid:760753108 byr:1931
hgt:179cm

hcl:#cfa07d eyr:2025 pid:166559648
iyr:2011 ecl:brn hgt:59in
`.trim()

const part1ExampleAnswers = [true, false, true, false];

/*
The first passport is valid - all eight fields are present. The second passport
is invalid - it is missing hgt (the Height field).

The third passport is interesting; the only missing field is cid, so it looks
like data from North Pole Credentials, not a passport at all! Surely, nobody
would mind if you made the system temporarily ignore missing cid fields. Treat
 this "passport" as valid.

The fourth passport is missing two fields, cid and byr. Missing cid is fine,
but missing any other field is not, so this passport is invalid.

According to the above rules, your improved system would report 2 valid passports.

Count the number of valid passports - those that have all required fields. Treat
cid as optional. In your batch file, how many passports are valid?
*/


function parseBatch(batchString) {
    const passports = []

    const parts = batchString.split('\n\n').map((part) => part.replace(/\s/gi, ' '))
    // console.log(parts)
    for (let part of parts) {
        const passport = {}
        const fields = part.split(' ' )
        for (let field of fields) {
            const [key, value] = field.split(':')
            // console.log(key, value)
            passport[key] = value
        }
        passports.push(passport)
    }
    return passports
}

function isValidPassport(passport, validators) {
    // valid => all fields present but cid
    let hasCID = false
    let present = 0
    let allFieldsValid = true

    for (let field of Object.keys(passportFields)) {
        const hasField = passport.hasOwnProperty(field)
        present += hasField ? 1 : 0

        if (hasField && validators) {
            const fieldIsValid = validators[field](passport[field])
            // if (fieldIsValid) {
            //     console.log(`valid(${field}, ${passport[field]}) === ${fieldIsValid}`)
            // }
            allFieldsValid = allFieldsValid && fieldIsValid
        }

        if (hasField && field === 'cid') {
            hasCID = true
        }
    }

    return allFieldsValid && ((present === 8) || (present === 7 && !hasCID))
}

function testPart1(input, validators) {
    const {validCount, answers} = countValidPassports(input, validators)

    for (let passportIx in answers) {
        const isValid = answers[passportIx]
        assert(
            isValid === part1ExampleAnswers[passportIx],
            `passport ${passportIx} Expected ${part1ExampleAnswers[passportIx]} !== ${isValid}`
        )
    }

    return validCount
}

assert(testPart1(part1Example) === 2, `Part 1 Examples Broken`)

function countValidPassports(input, validators) {
    let answers = []
    let validCount = 0
    const passports = parseBatch(input)

    for (let passportIx in passports) {
        const passport = passports[passportIx]
        const isValid = isValidPassport(passport, validators)
        answers.push(isValid)
        validCount += isValid ? 1 : 0
    }

    return {validCount, answers}
}

import fs from 'fs'
const PART1_INPUT = 'day4-input.txt'
var puzzleInput

try {
    console.log(process.cwd())
    puzzleInput = fs.readFileSync(PART1_INPUT, 'utf8');
} catch(e) {
    console.log(`Couldn't load ${PART1_INPUT}:`, e.stack);
    process.exit(-1)
}




// 1st try - 237
const part1ExpectedAnswer = 237
const {validCount: part1Answer } = countValidPassports(puzzleInput)
console.log(`Part 1 Answer = ${part1Answer}`)
assert(part1ExpectedAnswer === part1Answer, `Part 1 Answer is Broken - Expected ${part1ExpectedAnswer} !== ${part1Answer}`)



// Part 2

/*
--- Part Two ---
The line is moving more quickly now, but you overhear airport security talking
about how passports with invalid data are getting through. Better add some data
validation, quick!

You can continue to ignore the cid field, but each other field has strict rules
about what values are valid for automatic validation:

byr (Birth Year) - four digits; at least 1920 and at most 2002.
iyr (Issue Year) - four digits; at least 2010 and at most 2020.
eyr (Expiration Year) - four digits; at least 2020 and at most 2030.
hgt (Height) - a number followed by either cm or in:
               If cm, the number must be at least 150 and at most 193.
               If in, the number must be at least 59 and at most 76.
hcl (Hair Color) - a # followed by exactly six characters 0-9 or a-f.
ecl (Eye Color) - exactly one of: amb blu brn gry grn hzl oth.
pid (Passport ID) - a nine-digit number, including leading zeroes.
cid (Country ID) - ignored, missing or not.

Your job is to count the passports where all required fields are both present
and valid according to the above rules. Here are some example values:

byr valid:   2002
byr invalid: 2003

hgt valid:   60in
hgt valid:   190cm
hgt invalid: 190in
hgt invalid: 190

hcl valid:   #123abc
hcl invalid: #123abz
hcl invalid: 123abc

ecl valid:   brn
ecl invalid: wat

pid valid:   000000001
pid invalid: 0123456789

Here are some invalid passports:
*/
const part2InvalidExamples =
`eyr:1972 cid:100
hcl:#18171d ecl:amb hgt:170 pid:186cm iyr:2018 byr:1926

iyr:2019
hcl:#602927 eyr:1967 hgt:170cm
ecl:grn pid:012533040 byr:1946

hcl:dab227 iyr:2012
ecl:brn hgt:182cm pid:021572410 eyr:2020 byr:1992 cid:277

hgt:59cm ecl:zzz
eyr:2038 hcl:74454a iyr:2023
pid:3556412378 byr:2007`

// Here are some valid passports:

const part2ValidExamples =
`pid:087499704 hgt:74in ecl:grn iyr:2012 eyr:2030 byr:1980
hcl:#623a2f

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm

hcl:#888785
hgt:164cm byr:2001 iyr:2015 cid:88
pid:545766238 ecl:hzl
eyr:2022

iyr:2010 hgt:158cm hcl:#b6652a ecl:blu byr:1944 eyr:2021 pid:093154719`


/*
Count the number of valid passports - those that have all required fields and
valid values. Continue to treat cid as optional. In your batch file, how many
passports are valid?
*/

function isYear(value, min, max) {
    const intValue = parseInt(value, 10)
    return !isNaN(intValue) && (intValue >= min && intValue <= max)
}

const fieldValidators = {
    'byr': (value) => {
        // (Birth Year) - four digits; at least 1920 and at most 2002.
        return isYear(value, 1920, 2002)
    },
    'iyr': (value) => {
        // (Issue Year) - four digits; at least 2010 and at most 2020.
        return isYear(value, 2010, 2020)
    },
    'eyr': (value) => {
        // (Expiration Year) - four digits; at least 2020 and at most 2030.
        return isYear(value, 2020, 2030)
    },
    'hgt': (value) => {
        // (Height) - a number followed by either cm or in:
        //If cm, the number must be at least 150 and at most 193.
        //If in, the number must be at least 59 and at most 76.
        const re = /^(\d+)(in|cm)$/g
        const match = re.exec(value)
        if (match) {
            const height = parseInt(match[1], 10)
            if (match[2] === "cm") {
                return height >= 150 && height <= 193
            } else {
                assert(match[2] === "in")
                return height >= 59 && height <= 76

            }
        }
        return false
    },
    'hcl': (value) => {
        // // (Hair Color) - a # followed by exactly six characters 0-9 or a-f.
        const match = /#[a-f0-9]{6}/.exec(value)
        return !!match && match.length === 1
    },
    'ecl': (value) => {
        // // (Eye Color) - exactly one of: amb blu brn gry grn hzl oth.
        const colors = ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth']
        return -1 !== colors.indexOf(value)
    },
    'pid': (value) => {
        // // (Passport ID) - a nine-digit number, including leading zeroes.
        // console.log(`testing pid ${pid}`)
        const pidMatch = /^\d{9}$/g.exec(value)
        // console.log(pidMatch)
        const valid = !!pidMatch && (pidMatch.length === 1)

        // assert(expected === valid, `${pid}: expect ${expected} !== ${valid}`)
        return valid
        },
    'cid': () => {
        return true
    },
}

function testValidator(name, value, expected) {
    const actual = fieldValidators[name](value)
    assert(expected === actual, `${name}(${value}): expect ${expected} !== ${actual}`)
}

testValidator('byr', '', false)
testValidator('byr', 'a', false)
testValidator('byr', '1', false)
testValidator('byr', '12345', false)
testValidator('byr', '1919', false)
testValidator('byr', '1920', true)
testValidator('byr', '2002', true)
testValidator('byr', '2003', false)

testValidator('iyr', '2009', false)
testValidator('iyr', '2010', true)
testValidator('iyr', '2020', true)
testValidator('iyr', '2021', false)

testValidator('eyr', '2019', false)
testValidator('eyr', '2020', true)
testValidator('eyr', '2030', true)
testValidator('eyr', '2031', false)

testValidator('hgt', "", false)
testValidator('hgt', "a", false)
testValidator('hgt', "145", false)
testValidator('hgt', "145ft", false)

testValidator('hgt', "149cm", false)
testValidator('hgt', "150cm", true)
testValidator('hgt', "193cm", true)
testValidator('hgt', "194cm", false)

testValidator('hgt', "58in", false)
testValidator('hgt', "59in", true)
testValidator('hgt', "76in", true)
testValidator('hgt', "77in", false)

testValidator('hcl', "#abc", false)
testValidator('hcl', "#abc098", true)
testValidator('hcl', "#aBc098", false)

testValidator('ecl', "", false)
testValidator('ecl', "am", false)
testValidator('ecl', "amb", true)
testValidator('ecl', "AMB", false)

testValidator('pid', "", false)
testValidator('pid', "192cm", false)
testValidator('pid', "192", false)
testValidator('pid', "000000192", true)
testValidator('pid', "000000000", true)
testValidator('pid', "0000000001", false)

testValidator('cid', null, true)
testValidator('cid', '', true)
testValidator('cid', '123', true)
testValidator('cid', 'a', true)

let {validCount: test2Actual } = countValidPassports(part2InvalidExamples, fieldValidators)
assert(
    test2Actual === 0,
    `Part 2 Examples Broken - Expected 0 got ${test2Actual}`
)

test2Actual = countValidPassports(part2ValidExamples, fieldValidators).validCount
assert(
    test2Actual === 4,
    `Part 2 Examples Broken - Expected 0 got ${test2Actual}`
)


// 1st try - 2 (height was broken)
// 2nd try - 173 (too high - pid must be 9 chars)
// 3rd try - 172
const part2ExpectedAnswer = 172
const {validCount: part2Answer } = countValidPassports(puzzleInput, fieldValidators)
console.log(`Part 2 Answer = ${part2Answer}`)
assert(
    part2ExpectedAnswer === part2Answer,
    `Part 2 Answer is Broken - Expected ${part2ExpectedAnswer} !== ${part2Answer}`)

