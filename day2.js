// Intcode Computer

//--------------------------- PART ONE ---------------------------

const INSTRUCTIONS = {
    1: (memory , ip) => {
        const a = memory[memory[ip + 1]]
        const b = memory[memory[ip + 2]]
        memory[memory[ip + 3]] = a + b
        return ip + 4
    },
    2: (memory , ip) => {
        const a = memory[memory[ip + 1]]
        const b = memory[memory[ip + 2]]
        memory[memory[ip + 3]] = a * b
        return ip + 4
    },
    99: (program, pc) => NaN
}

function runProgram(memory) {
    const output = memory.slice(0)
    let ip = 0
    while (ip < output.length) {
        opcode = output[ip]
        const instruction = INSTRUCTIONS[opcode]
        console.assert(instruction, `Invalid Opcode ${opcode} halting`)
        ip = instruction(output, ip)
    }
    return output
}

function test(intcode, expected) {
    const actual = runProgram(intcode)
    console.assert(
        arraysEqual(actual, expected),
        `runProgram([${intcode}])
        Actual   = [${actual}]
        Expected = [${expected}]`)
}

function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}

test([99], [99])
test([1,0,0,0,99], [2,0,0,0,99])
test([2,3,0,3,99], [2,3,0,6,99])
test([2,4,4,5,99,0], [2,4,4,5,99,9801])
test([1,1,1,4,99,5,6,0,99], [30,1,1,4,2,5,6,0,99])
test([1,9,10,3,2,3,11,0,99,30,40,50], [3500,9,10,70,2,3,11,0,99,30,40,50])

const puzzleInput = [1,0,0,3,1,1,2,3,1,3,4,3,1,5,0,3,2,13,1,19,1,6,19,23,2,6,23,27,1,5,27,31,2,31,9,35,1,35,5,39,1,39,5,43,1,43,10,47,2,6,47,51,1,51,5,55,2,55,6,59,1,5,59,63,2,63,6,67,1,5,67,71,1,71,6,75,2,75,10,79,1,79,5,83,2,83,6,87,1,87,5,91,2,9,91,95,1,95,6,99,2,9,99,103,2,9,103,107,1,5,107,111,1,111,5,115,1,115,13,119,1,13,119,123,2,6,123,127,1,5,127,131,1,9,131,135,1,135,9,139,2,139,6,143,1,143,5,147,2,147,6,151,1,5,151,155,2,6,155,159,1,159,2,163,1,9,163,0,99,2,0,14,0]

// Fixup program
function fix(memory, noun, verb) {
    const result = memory.slice(0)
    result[1] = noun
    result[2] = verb
    return result
}

function gravityAssist(noun, verb) {
    return runProgram(fix(puzzleInput, noun, verb))[0]
}

answer = gravityAssist(12, 2)
console.log(`Part 1 Answer = ${answer}`)
console.assert(10566835 === answer)
// correct answer : 10566835

//--------------------------- PART DEUX ---------------------------

// determine what pair of inputs produces the output 19690720
// by changing the noun memory[1] and verb memory[2]

function test2(noun, verb, expected) {
    const actual = gravityAssist(noun, verb)
    console.assert(
        actual === expected,
        `Actual ${actual} != ${expected} for noun = ${noun}, verb = ${verb}`
    )
}
test2(12, 2, 10566835)

function findAnswer2() {
    for (let noun = 0; noun < 100 ; noun++) {
        for (let verb = 0; verb < 100 ; verb++) {
            const answer = gravityAssist(noun, verb)
            const delta = 19690720 - answer
            //console.log(`gravityAssist(${noun}, ${verb}) = ${answer} (${delta})`)
            if (delta === 0) {
                return 100 * noun + verb
            }
        }
    }
}

console.log(`Part 1 Answer = ${findAnswer2()}`)