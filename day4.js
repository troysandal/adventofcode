// Part 1

/*
However, they do remember a few key facts about the password:

It is a six-digit number.
The value is within the range given in your puzzle input.
Two adjacent digits are the same (like 22 in 122345).
Going from left to right, the digits never decrease; 
they only ever increase or stay the same (like 111123 or 135679).
*/
function isPassword(password, min, max) {
    const isSixDigit = password >= 100000 && password <= 999999
    const inRange = password >= min && password <= max
    if (isSixDigit && inRange) {
        const digits = ('' + password).split('')
        let pair = false
        let incrementing = true
        for (let i = 0 ; i < (digits.length - 1) ; i++) {
            if (digits[i] === digits[i + 1]) {
                if (digits[i-1] !== digits[i] && digits[i+1] !== digits[i+2]) {
                    pair = pair || true
                }
            }
            if (digits[i] > digits[i + 1]) {
                incrementing = false
            }
        }
        return pair && incrementing
    }
    return false
}


function test(password, min, max, expected) {
    const actual = isPassword(password, min, max)
    console.assert(
        actual === expected,
        `${password} expected ${expected} !== ${actual}`
    )
}

test(111111, 100000, 999999, false)
test(223450, 100000, 999999, false)
test(123789, 100000, 999999, false)

test(112233, 100000, 999999, true)
test(123444, 100000, 999999, false)
test(112233, 100000, 999999, true)

function findPasswordsInRange(min, max) {
    let result = 0
    for (let password = min ; password <= max ; password++) {
        if (isPassword(password, min, max)) {
            result++
        }
    }
    console.log(`Found ${result} passwords in [${min}, ${max}]`)
}

findPasswordsInRange(100000, 999999)
findPasswordsInRange(128392, 643281)


