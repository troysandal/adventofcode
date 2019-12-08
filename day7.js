// day7.js - Amplifiers

// Part 1 

function assert(condition, message) {
    if (!condition) {
        debugger
        console.assert(false, message)
    }
}
function parameterMode(opcode, offset) {
    return Math.trunc(opcode / (10 ** ((offset-1) + 2))) % 10
}
assert(parameterMode(1102, 1) === 1)
assert(parameterMode(1102, 2) === 1)
assert(parameterMode(1102, 3) === 0)

function fetch(memory, ip, offset) {
    const pmode = parameterMode(memory[ip], offset)
    // Immediate value
    assert(pmode === 0 || pmode === 1, `Unknown param pmode ${pmode}`)
    let result = memory[ip + offset]
    if (pmode === 0) {
        result = memory[result]
    }
    return result
}

const IP_HALT = NaN
const IP_YIELD = -2

const INSTRUCTIONS = {
    1: { 
        name: 'ADD',
        length: 4,
        run: (memory , ip) => {
            const a = fetch(memory, ip, 1)
            const b = fetch(memory, ip, 2)
            memory[memory[ip + 3]] = a + b
            return ip + 4
        },
    },
    2: { 
        name: 'MUL',
        length: 4,
        run: (memory , ip) => {
            const a = fetch(memory, ip, 1)
            const b = fetch(memory, ip, 2)
            memory[memory[ip + 3]] = a * b
            return ip + 4
        }
    },
    3: { 
        name: 'INP',
        length: 2,
        run: (memory, ip, inputs) => {
            let input
            if (typeof inputs === "function") {
                input = inputs()
            } else {
                // assert(inputs.length, 'OUT OF INPUTS!')
                if (!inputs.length) {
                    return IP_YIELD
                }
                input = inputs.shift()
            }
            memory[memory[ip + 1]] = input
            return ip + 2
        }
    },
    // write output
    4: { 
        name: 'OUT',
        length: 2,
        run: (memory, ip, input, output) => {
            const value = fetch(memory, ip, 1)
            output.push(value)
            return ip + 2
        }
    },
    // jump if true
    5: { 
        name: 'JMPT',
        length: 3,
        run: (memory, ip) => {
            const value = fetch(memory, ip, 1)
            if (value) {
                ip = fetch(memory, ip, 2)
            } else {
                ip = ip + 3
            }
            return ip
        }
    },
    // jump if false
    6: { 
        name: 'JMPF',
        length: 3,
        run: (memory, ip) => {
            const value = fetch(memory, ip, 1)
            if (!value) {
                ip = fetch(memory, ip, 2)
            } else {
                ip = ip + 3
            }
            return ip
        }
    },
    // less than
    7: { 
        name: 'LT',
        length: 4,
        run: (memory, ip) => {
            const a = fetch(memory, ip, 1)
            const b = fetch(memory, ip, 2)
            let result = 0
            if (a < b) {
                result = 1
            }
            memory[memory[ip + 3]] = result        
            return ip + 4
        }
    },
    // equal
    8: { 
        name: 'EQ',
        length: 4,
        run: (memory, ip) => {
            const a = fetch(memory, ip, 1)
            const b = fetch(memory, ip, 2)
            let result = 0
            if (a === b) {
                result = 1
            }
            memory[memory[ip + 3]] = result        
            return ip + 4
        }
    },
    // greater than
    98: { 
        name: 'GT',
        length: 4,
        run: (memory, ip) => {
            const a = fetch(memory, ip, 1)
            const b = fetch(memory, ip, 2)
            let result = 0
            if (a > b) {
                result = 1
            }
            memory[memory[ip + 3]] = result        
            return ip + 4
        }
    },
    99: { 
        name: 'END',
        length: 1,
        run: (memory, pc) => IP_HALT
    },
}

function runProgram(state) {
    let {program, input = [], output = [], ip = 0, name='?'} = state
    const memory = program.slice(0)
    console.log(`running program ${name} input=[${input}]`)
    while (ip < memory.length) {
        opcode = memory[ip]
        const instruction = INSTRUCTIONS[opcode % 100]
        assert(instruction,
            `Invalid Opcode ${opcode}
            ip=${ip} halting
            input=${input}
            output=${output}`)
        // printInstruction({memory, ip})
        let newIp = instruction.run(memory, ip, input, output)
        if (newIp === IP_YIELD) { break }
        ip = newIp
    }
    return {program:memory, input, output, ip, name}
}

const MAX_INSTR_LENGTH = Object.values(INSTRUCTIONS).reduce((p, c) =>  Math.max(p, c.length), 0)
const MAX_INSTR_NAME_LENGTH = Object.values(INSTRUCTIONS).reduce((p, c) =>  Math.max(p, c.name.length), 0)

function printInstruction(cpu) {
    let fields = []
    const opcode = cpu.memory[cpu.ip]
    const instruction = INSTRUCTIONS[opcode % 100]
    fields.push((opcode).toString(10).padStart(instruction.length - 1 + 2, 0).padStart(MAX_INSTR_LENGTH - 1 + 2, ' '))
    fields.push(instruction.name.padEnd(MAX_INSTR_NAME_LENGTH, ' '))
    const params = []
    const pvalues = []
    for (let pix = 1; pix < instruction.length; pix++) {
        const pmode = parameterMode(cpu.memory[cpu.ip], pix)
        const pvalue = cpu.memory[cpu.ip + pix]
        params.push(pmode ? pvalue : `[${pvalue}]`)
        pvalues.push(pmode ? pvalue : cpu.memory[cpu.memory[cpu.ip + pix]])
    }
    fields.push(params.join(', '))
    fields = [fields.join(' ').padEnd(30, ' ')]
    fields.push(` ; (${pvalues.join(',')})`)
    fields = [fields.join(' ').padEnd(60, ' ')]
    fields.push('[' + cpu.memory.slice(cpu.ip, cpu.ip + instruction.length).join(',') + ']')
    console.log(fields.join(' '))
}

function testDepth(program, expected, input = [], expectedOutput = []) {
    const result = runProgram({program, input})
    const actual = result.program
    const actualOutput = result.output

    let expectedProgramsMatch = true
    if (expected) {
        expectedProgramsMatch = arraysEqual(actual, expected)
    }
    assert(
        expectedProgramsMatch && arraysEqual(actualOutput, expectedOutput),
        `runProgram([${program}])
        Actual   = [${actual}]
        Expected = [${expected}]
        inputs   = [${input}]
        actOut   = [${actualOutput}]
        expOut   = [${expectedOutput}]`)
}

function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}

function runTests() {    
    // Basics
    testDepth([99], [99])

    // Resume
    //             [0,1, 2,3, 4,5, 6, 7, 8,9, 10,11,12]
    const resume = [3,11,3,12,1,11,12,11,4,11,99,-1,-1]
    let state
    state = runProgram({program: resume})
    state.input = [1]
    state = runProgram(state)
    state.input = [1]
    state = runProgram(state)
    console.assert(state.output.pop() === 2, `Didn't get 2`)
    // Unit Tests
    testDepth([3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9], [3,12,6,12,15,1,13,14,13,4,13,99,0,0,1,9], [0], [0])
    testDepth([3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9], [3,12,6,12,15,1,13,14,13,4,13,99,1,1,1,9], [1], [1])
    testDepth([3,3,1105,-1,9,1101,0,0,12,4,12,99,1], [3,3,1105,0,9,1101,0,0,12,4,12,99,0], [0], [0])
    testDepth([3,3,1105,-1,9,1101,0,0,12,4,12,99,1], [3,3,1105,5,9,1101,0,0,12,4,12,99,1], [5], [1])
    // negative #s
    testDepth([1101,100,-1,4,0], [1101,100,-1,4,99])

    const big = [3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99]
    testDepth(big, undefined, [6], [999])
    testDepth(big, undefined, [8], [1000])
    testDepth(big, undefined, [10], [1001])

    // unit tests
    testDepth([3,9,8,9,10,9,4,9,99,-1,8], null, [8], [1])
    testDepth([3,9,8,9,10,9,4,9,99,-1,8], null, [4], [0])
    testDepth([3,9,7,9,10,9,4,9,99,-1,8], null, [7], [1])
    testDepth([3,9,7,9,10,9,4,9,99,-1,8], null, [9], [0])

    testDepth([3,3,1108,-1,8,3,4,3,99], null, [8], [1])
    testDepth([3,3,1108,-1,8,3,4,3,99], null, [4], [0])

    testDepth([3,3,1107,-1,8,3,4,3,99], null, [7], [1])
    testDepth([3,3,1107,-1,8,3,4,3,99], null, [9], [0])

    // jump if true
    testDepth([1105,1,4,99,1101,1,1,0,99], [2,1,4,99,1101,1,1,0,99])
    testDepth([1105,0,4,99,1101,1,1,0,99], [1105,0,4,99,1101,1,1,0,99])
    // jump if false
    testDepth([1106,0,4,99,1101,1,1,0,99], [2,0,4,99,1101,1,1,0,99])
    testDepth([1106,1,4,99,1101,1,1,0,99], [1106,1,4,99,1101,1,1,0,99])
    // Less than opcode 7
    testDepth([7,0,1,0,99], [0,0,1,0,99])
    testDepth([7,0,4,0,99], [1,0,4,0,99])
    testDepth([1107,0,1,0,99], [1,0,1,0,99])

    // Equal
    testDepth([1108,0,1,0,99], [0,0,1,0,99])
    testDepth([1108,1,1,0,99], [1,1,1,0,99])

    // Greater than
    testDepth([98,0,1,0,99], [1,0,1,0,99])
    testDepth([98,0,4,0,99], [0,0,4,0,99])
    testDepth([1198,0,1,0,99], [0,0,1,0,99])
    
    testDepth([3,0,4,0,99], [1,0,4,0,99], [1], [1])
    testDepth([1002,4,3,4,33], [1002,4,3,4,99])
    testDepth([1,0,0,0,99], [2,0,0,0,99])
    testDepth([2,3,0,3,99], [2,3,0,6,99])
    testDepth([2,4,4,5,99,0], [2,4,4,5,99,9801])
    testDepth([1,1,1,4,99,5,6,0,99], [30,1,1,4,2,5,6,0,99])
    testDepth([1,9,10,3,2,3,11,0,99,30,40,50], [3500,9,10,70,2,3,11,0,99,30,40,50])
}

const puzzleInput = [
    3,8,1001,8,10,8,105,1,0,0,21,42,51,60,77,94,175,256,337,418,99999,3,9,1001,9,4,9,102,5,9,9,1001,9,3,9,102,5,9,9,4,9,99,3,9,102,2,9,9,4,9,99,3,9,1001,9,3,9,4,9,99,3,9,101,4,9,9,1002,9,4,9,101,5,9,9,4,9,99,3,9,1002,9,5,9,101,3,9,9,102,2,9,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,99,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,99
]

function signalPower(program, phases) {
    let input = 0
    let state
    for (let phase of phases) {
        state = runProgram({program, input:[phase, input]})
        input = state.output[0]
    }
    return input
}

function testSignal(program, phases, expected) {
    const actual = signalPower(program, phases)
    console.assert(actual === expected, `Expected ${expected}, got ${actual}`)
}

function feedbackSignalPower(program, phases) {
    let lastOutput = 0
    let ampIndex = 0
    let ampStates = []
    let running = true
    while (running) {
        if (!ampStates[ampIndex]) {
            // 1st run, pass in phase
            ampStates[ampIndex] = {program, input: [phases[ampIndex], lastOutput], name: `Amp ${String.fromCharCode(65 + ampIndex)}`}
        } else {
            // already run, continue at last state with input from previous amp
            ampStates[ampIndex].input = [lastOutput]
        }
        ampStates[ampIndex] = runProgram(ampStates[ampIndex])
        lastOutput = ampStates[ampIndex].output.pop()
        ampIndex = (ampIndex + 1) % phases.length
        if (ampStates[ampIndex]) {
            running = !isNaN(ampStates[ampIndex].ip)
        }
    }
    return lastOutput
}

function testFeedbackSignal(program, phases, expected) {
    const actual = feedbackSignalPower(program, phases)
    console.assert(actual === expected, `Expected ${expected}, got ${actual}`)
}


function perms(keys) {
    if (keys.length === 1) {
        return [keys]
    }
    const result = []
    for (const key of keys) {
        const remaining = keys.filter((v) => v !== key)
        const ps = perms(remaining)
        for (const p of ps) {
            result.push([key, ...p])
        }
    }
    return result
}

function testPerms(input, expected) {
    const actual = perms(input)
    assert(arraysEqual(actual, expected), `[${actual}] !== [${expected}]`)
}
console.log(JSON.stringify(perms([0])))
console.log(JSON.stringify(perms(['A','B','C'])))
testPerms([0], [[0]])
testPerms([0,1], [[0,1], [1,0]])
testPerms(
    ['A','B','C'],
    [["A","B","C"],["A","C","B"],["B","A","C"],["B","C","A"],["C","A","B"],["C","B","A"]]
)

function main() {
    console.log('Testing...')
    runTests()

    console.log('Part One')
    testSignal([3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0], [4,3,2,1,0], 43210)
    testSignal([3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0], [0,1,2,3,4], 54321)
    testSignal([3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0], [1,0,4,3,2], 65210)  

    const allperms = perms([0,1,2,3,4])
    let maxPower = 0
    for (const perm of allperms) {
        const power = signalPower(puzzleInput, perm)
        maxPower = Math.max(power, maxPower)
    }
    console.log(`Part One Answer = ${maxPower}`)
    console.assert(maxPower === 18812, `BLECK`)

    // Part II
    testFeedbackSignal(
        [3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,
        27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5], 
        [9,8,7,6,5], 139629729
    )
    testFeedbackSignal(
        [3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,
        -5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,
        53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10],
        [9,7,8,5,6], 18216
    )

    const allperms2 = perms([5,6,7,8,9])
    let maxPower2 = 0
    for (const perm of allperms2) {
        const power = feedbackSignalPower(puzzleInput, perm)
        maxPower2 = Math.max(power, maxPower2)
    }
    console.log(`Part Two Answer = ${maxPower2}`)
    // console.assert(maxPower2 === 18812, `BLECK`)
}

main()
