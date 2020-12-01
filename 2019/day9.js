// day9.js - IntComputer + Relative Base Parameters
// Steps
// X general computer state: {memory, ip, rb, input, output}
// - add new unit tests
// x opcode 9 - adjust relative base by param 1
// x fetch() for param mode 2
// x print() for param mode 2
// x poke() - replace all sets with this, support param mode 2
// - poke() - large memory support
// - fetch() - large memory support
// - all tests passing

// Part 1 

function assert(condition, message) {
    if (!condition) {
        debugger
        console.assert(false, message)
    }
}
function parameterMode(opcode, offset) {
    const pmode = Math.trunc(opcode / (10 ** ((offset-1) + 2))) % 10
    assert(pmode >= 0 && pmode <= 2, `invalid parameter mode ${pmode}`)
    return pmode
}
assert(parameterMode(1102, 1) === 1)
assert(parameterMode(1102, 2) === 1)
assert(parameterMode(1102, 3) === 0)
assert(parameterMode(1202, 1) === 2)

function peek(memory, address) {
    if (address >= memory.length) {
        return 0
    }
    return memory[address]
}
function peekTest(m, a, e) { console.assert(peek(m, a) === e, `peekTest([${m}], ${a}) !== ${e}`)}
(function peekTests() {
    peekTest([1,2,3], 0, 1)
    peekTest([1,2,3], 4, 0)
    peekTest([1,2,3], 400000, 0)
})()

function fetch(state, offset) {
    const address = deref(state, offset)
    return peek(state.memory, address)
}

function poke(memory, address, value) {
    if (address > memory.length) {
        for (let i = memory.length ; i < address ; i++) {
            memory[i] = 0
        }
    }
    memory[address] = value
}

function pokeTest(m, a, v, e) {
    poke(m, a, v)
    console.assert(arraysEqual(m, e), `${m} !== !{e}`)
}
function pokeTests() {
    pokeTest([1,2,3], 0, 8, [8,2,3])
    pokeTest([1,2,3], 1, 8, [1,8,3])
    pokeTest([1,2,3], 2, 8, [1,2,8])
    pokeTest([1,2,3], 3, 8, [1,2,3,8])
    pokeTest([1,2,3], 4, 8, [1,2,3,0,8])
    pokeTest([1,2,3], 5, 8, [1,2,3,0,0,8])
}
pokeTests()

function deref(state, offset) {
    const {memory, ip, rb} = state
    const pmode = parameterMode(memory[ip], offset)
    const pvalue = memory[ip + offset]

    if (pmode === 0) {
        return pvalue             // Position Mode aka Absolute Position
    } else if (pmode === 1) {
        return ip + offset        // Immediate Mode
    } else if (pmode === 2) {
        return rb + pvalue        // Relative Base Mode aka Relative Position
    }

    throw new `Invalid pmode ${pmode}`
}

console.assert(7   === deref({memory:[109,2,21001,7,7,100,99,1,1], ip:2, rb: 2}, 1))
console.assert(4   === deref({memory:[109,2,21001,7,7,100,99,1,1], ip:2, rb: 2}, 2))
console.assert(102 === deref({memory:[109,2,21001,7,7,100,99,1,1], ip:2, rb: 2}, 3))

function setParam(state, offset, value) {
    const address = deref(state, offset)
    console.assert(1 !== parameterMode(state.memory[state.ip], offset))
    poke(state.memory, address, value)
}

const IP_HALT = NaN
const IP_YIELD = -2

const INSTRUCTIONS = {
    1: { 
        name: 'ADD',
        length: 4,
        run: (state) => {
            const {ip} = state
            const a = fetch(state, 1)
            const b = fetch(state, 2)
            setParam(state, 3, a + b)
            return ip + 4
        },
    },
    2: { 
        name: 'MUL',
        length: 4,
        run: (state) => {
            const {ip} = state
            const a = fetch(state, 1)
            const b = fetch(state, 2)
            setParam(state, 3, a * b)
            return ip + 4
        }
    },
    3: { 
        name: 'INP',
        length: 2,
        run: (state) => {
            const {memory, ip, input} = state
            let value
            if (typeof input === "function") {
                value = input()
            } else {
                if (!input.length) {
                    return IP_YIELD
                }
                value = input.shift()
            }
            setParam(state, 1, value)
            return ip + 2
        }
    },
    // write output
    4: { 
        name: 'OUT',
        length: 2,
        run: (state) => {
            const {ip, output} = state
            const value = fetch(state, 1)
            output.push(value)
            return ip + 2
        }
    },
    // jump if true
    5: { 
        name: 'JMPT',
        length: 3,
        run: (state) => {
            let {ip} = state
            const value = fetch(state, 1)
            if (value) {
                ip = fetch(state, 2)
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
        run: (state) => {
            let {ip} = state
            const value = fetch(state, 1)
            if (!value) {
                ip = fetch(state, 2)
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
        run: (state) => {
            const {ip} = state
            const a = fetch(state, 1)
            const b = fetch(state, 2)
            let result = 0
            if (a < b) {
                result = 1
            }
            setParam(state, 3, result)
            return ip + 4
        }
    },
    // equal
    8: { 
        name: 'EQ',
        length: 4,
        run: (state) => {
            const {ip} = state
            const a = fetch(state, 1)
            const b = fetch(state, 2)
            let result = 0
            if (a === b) {
                result = 1
            }
            setParam(state, 3, result)
            return ip + 4
        }
    },
    // SETRB
    9: { 
        name: 'SETRB',
        length: 2,
        run: (state) => {
            state.rb += fetch(state, 1)
            return state.ip + 2
        }
    },
    99: { 
        name: 'END',
        length: 1,
        run: (state) => IP_HALT
    },
}

function runProgram(state) {
    let {program, input = [], output = [], ip = 0, rb = 0, name='?'} = state
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
        let inState = {memory, ip, rb, input, output}
        // printInstruction(inState)
        let newIp = instruction.run(inState)
        rb = inState.rb
        if (newIp === IP_YIELD) { break }
        ip = newIp
    }
    return {program:memory, input, output, ip, rb, name}
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
    function pmodeDecorator(pmode, pvalue) {
        if (pmode === 0) {
            return `[${pvalue}]`
        } else if (pmode === 1) {
            return `${pvalue}`
        } else if (pmode === 2) {
            return `{${cpu.rb + pvalue}}`
        }
        throw `Invalid pmode ${pmode}`
    }
    for (let pix = 1; pix < instruction.length; pix++) {
        const pmode = parameterMode(cpu.memory[cpu.ip], pix)
        const pvalue = peek(cpu.memory, cpu.ip + pix)
        params.push(pmodeDecorator(pmode, pvalue))
        pvalues.push(fetch(cpu, pix))
    }
    fields.push(params.join(', '))
    fields = [fields.join(' ').padEnd(40, ' ')]
    fields.push(` ; (${pvalues.join(',')})`)
    fields = [fields.join(' ').padEnd(70, ' ')]
    fields.push('[' + cpu.memory.slice(cpu.ip, cpu.ip + instruction.length).join(',') + ']')
    fields.push(`IP=${cpu.ip} RB=${cpu.rb}`)
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
    testDepth([1101,100,-1,4,0], [1101,100,-1,4,99])
    // Day 9 - opcode 9, set rb
    testDepth([109,1,109,1,1201,0,-109,13,1008,13,0,14,99,0,0],[109,1,109,1,1201,0,-109,13,1008,13,0,14,99,0,1])
    testDepth([  9, 7, 22201, 0, 1, 0, 99, 7 ,1], [  9, 7, 22201, 0, 1, 0, 99, 8 ,1])
    testDepth([109, 7, 22201, 0, 1, 0, 99, 1 ,1], [109, 7, 22201, 0, 1, 0, 99, 2 ,1])
    testDepth([209, 7, 22201, 0, 1, 0, 99, 7 ,1], [209, 7, 22201, 0, 1, 0, 99, 8 ,1])
    // duplicate 
    testDepth(
        [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99], 
        null,
        [],
        [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99])
    testDepth(
        [1102,34915192,34915192,7,4,7,99,0], 
        null,
        [],
        [1219070632396864]
    )
    testDepth(
        [104,1125899906842624,99], 
        null,
        [],
        [1125899906842624]
    )
    
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

    testDepth([3,0,4,0,99], [1,0,4,0,99], [1], [1])
    testDepth([1002,4,3,4,33], [1002,4,3,4,99])
    testDepth([1,0,0,0,99], [2,0,0,0,99])
    testDepth([2,3,0,3,99], [2,3,0,6,99])
    testDepth([2,4,4,5,99,0], [2,4,4,5,99,9801])
    testDepth([1,1,1,4,99,5,6,0,99], [30,1,1,4,2,5,6,0,99])
    testDepth([1,9,10,3,2,3,11,0,99,30,40,50], [3500,9,10,70,2,3,11,0,99,30,40,50])
}


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

function day7Tests() {
    const puzzleInput = [
        3,8,1001,8,10,8,105,1,0,0,21,42,51,60,77,94,175,256,337,418,99999,3,9,1001,9,4,9,102,5,9,9,1001,9,3,9,102,5,9,9,4,9,99,3,9,102,2,9,9,4,9,99,3,9,1001,9,3,9,4,9,99,3,9,101,4,9,9,1002,9,4,9,101,5,9,9,4,9,99,3,9,1002,9,5,9,101,3,9,9,102,2,9,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,99,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,99
    ]

    runTests()

    testSignal([3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0], [4,3,2,1,0], 43210)
    testSignal([3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0], [0,1,2,3,4], 54321)
    testSignal([3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0], [1,0,4,3,2], 65210)  

    const allperms = perms([0,1,2,3,4])
    let maxPower = 0
    for (const perm of allperms) {
        const power = signalPower(puzzleInput, perm)
        maxPower = Math.max(power, maxPower)
    }
    assert(maxPower === 18812, `BLECK`)

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
    assert(maxPower2 === 25534964, `BLECK`)
}

day7Tests()

function main() {
    const puzzleInput = [1102,34463338,34463338,63,1007,63,34463338,63,1005,63,53,1101,3,0,1000,109,988,209,12,9,1000,209,6,209,3,203,0,1008,1000,1,63,1005,63,65,1008,1000,2,63,1005,63,904,1008,1000,0,63,1005,63,58,4,25,104,0,99,4,0,104,0,99,4,17,104,0,99,0,0,1102,1,31,1018,1102,352,1,1023,1101,0,1,1021,1101,0,33,1003,1102,1,36,1007,1102,21,1,1005,1101,359,0,1022,1101,0,787,1024,1102,1,24,1011,1101,30,0,1014,1101,22,0,1016,1101,0,0,1020,1102,1,29,1000,1101,778,0,1025,1102,23,1,1017,1102,1,28,1002,1101,38,0,1019,1102,1,27,1013,1102,1,32,1012,1101,0,37,1006,1101,444,0,1027,1102,1,20,1009,1101,0,447,1026,1101,0,39,1008,1101,35,0,1010,1102,559,1,1028,1102,26,1,1004,1102,1,25,1015,1102,1,34,1001,1101,0,554,1029,109,-3,2101,0,9,63,1008,63,34,63,1005,63,205,1001,64,1,64,1105,1,207,4,187,1002,64,2,64,109,23,21107,40,39,-7,1005,1013,227,1001,64,1,64,1106,0,229,4,213,1002,64,2,64,109,-17,1202,-2,1,63,1008,63,36,63,1005,63,249,1106,0,255,4,235,1001,64,1,64,1002,64,2,64,109,-6,1202,10,1,63,1008,63,36,63,1005,63,277,4,261,1106,0,281,1001,64,1,64,1002,64,2,64,109,-2,1208,9,26,63,1005,63,303,4,287,1001,64,1,64,1106,0,303,1002,64,2,64,109,32,1206,-7,321,4,309,1001,64,1,64,1106,0,321,1002,64,2,64,109,-29,1207,7,20,63,1005,63,337,1105,1,343,4,327,1001,64,1,64,1002,64,2,64,109,27,2105,1,-2,1001,64,1,64,1106,0,361,4,349,1002,64,2,64,109,-25,2108,39,7,63,1005,63,377,1106,0,383,4,367,1001,64,1,64,1002,64,2,64,109,1,1201,6,0,63,1008,63,36,63,1005,63,409,4,389,1001,64,1,64,1105,1,409,1002,64,2,64,109,1,2102,1,1,63,1008,63,33,63,1005,63,435,4,415,1001,64,1,64,1105,1,435,1002,64,2,64,109,28,2106,0,-3,1106,0,453,4,441,1001,64,1,64,1002,64,2,64,109,-13,21101,41,0,1,1008,1018,44,63,1005,63,477,1001,64,1,64,1106,0,479,4,459,1002,64,2,64,109,4,21108,42,42,-2,1005,1019,501,4,485,1001,64,1,64,1106,0,501,1002,64,2,64,109,-21,2101,0,2,63,1008,63,28,63,1005,63,523,4,507,1105,1,527,1001,64,1,64,1002,64,2,64,109,26,1205,-5,545,4,533,1001,64,1,64,1105,1,545,1002,64,2,64,109,3,2106,0,-1,4,551,1106,0,563,1001,64,1,64,1002,64,2,64,109,-33,1201,4,0,63,1008,63,28,63,1005,63,583,1105,1,589,4,569,1001,64,1,64,1002,64,2,64,109,11,2107,27,-3,63,1005,63,609,1001,64,1,64,1106,0,611,4,595,1002,64,2,64,109,8,21102,43,1,3,1008,1018,43,63,1005,63,637,4,617,1001,64,1,64,1105,1,637,1002,64,2,64,109,-5,21108,44,41,0,1005,1010,653,1105,1,659,4,643,1001,64,1,64,1002,64,2,64,109,-13,2108,21,8,63,1005,63,681,4,665,1001,64,1,64,1106,0,681,1002,64,2,64,109,6,1207,0,34,63,1005,63,703,4,687,1001,64,1,64,1105,1,703,1002,64,2,64,109,7,1208,-7,35,63,1005,63,723,1001,64,1,64,1106,0,725,4,709,1002,64,2,64,109,-13,2102,1,7,63,1008,63,23,63,1005,63,745,1105,1,751,4,731,1001,64,1,64,1002,64,2,64,109,13,1205,10,767,1001,64,1,64,1105,1,769,4,757,1002,64,2,64,109,14,2105,1,0,4,775,1001,64,1,64,1106,0,787,1002,64,2,64,109,-20,21107,45,46,7,1005,1011,809,4,793,1001,64,1,64,1105,1,809,1002,64,2,64,109,-3,2107,25,3,63,1005,63,827,4,815,1106,0,831,1001,64,1,64,1002,64,2,64,109,13,1206,7,847,1001,64,1,64,1106,0,849,4,837,1002,64,2,64,109,-11,21101,46,0,7,1008,1010,46,63,1005,63,871,4,855,1106,0,875,1001,64,1,64,1002,64,2,64,109,15,21102,47,1,-4,1008,1014,48,63,1005,63,895,1106,0,901,4,881,1001,64,1,64,4,64,99,21102,27,1,1,21101,0,915,0,1106,0,922,21201,1,63208,1,204,1,99,109,3,1207,-2,3,63,1005,63,964,21201,-2,-1,1,21102,1,942,0,1106,0,922,21202,1,1,-1,21201,-2,-3,1,21101,957,0,0,1105,1,922,22201,1,-1,-2,1106,0,968,21201,-2,0,-2,109,-3,2106,0,0]
    let state = runProgram({program:puzzleInput, input:[1], name:'Day 9 - Part One'})
    console.log(state.output[0])
    console.log(state.output[0] === 3507134798)

    state = runProgram({program:puzzleInput, input:[2], name:'Day 9 - Part Two'})
    console.log(state.output[0])
}
main()
