// The IntCode Computer 9000

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
    return memory[address] || 0
}
function peekTest(m, a, e) { assert(peek(m, a) === e, `peekTest([${m}], ${a}) !== ${e}`)}
(function peekTests() {
    peekTest([1,2,3], 0, 1)
    peekTest([1,2,3], 4, 0)
    peekTest([1,2,3], 400000, 0)
})()

function fetch(state, offset) {
    const [address] = deref(state, offset)
    return peek(state.memory, address)
}

function poke(memory, address, value) {
    memory[address] = value
}

function pokeTest(m, a, v, e) {
    poke(m, a, v)
    assert(arraysEqual(m, e), `${m} !== !{e}`)
}
(function pokeTests() {
    pokeTest([1,2,3], 0, 8, [8,2,3])
    pokeTest([1,2,3], 1, 8, [1,8,3])
    pokeTest([1,2,3], 2, 8, [1,2,8])
    pokeTest([1,2,3], 3, 8, [1,2,3,8])
    pokeTest([1,2,3], 4, 8, [1,2,3,,8])
    pokeTest([1,2,3], 5, 8, [1,2,3,,,8])
})()

function deref(state, offset) {
    const {memory, ip, rb} = state
    const pmode = parameterMode(memory[ip], offset)
    const pvalue = memory[ip + offset]

    if (pmode === 0) {
        return [pvalue, pmode]             // Position Mode aka Absolute Position
    } else if (pmode === 1) {
        return [ip + offset, pmode]        // Immediate Mode
    } else if (pmode === 2) {
        return [rb + pvalue, pmode]        // Relative Base Mode aka Relative Position
    }

    throw new `Invalid pmode ${pmode}`
}

(function deferTests() {
    assert(arraysEqual([7,0], deref({memory:[109,2,21001,7,7,100,99,1,1], ip:2, rb: 2}, 1)))
    assert(arraysEqual([4,1], deref({memory:[109,2,21001,7,7,100,99,1,1], ip:2, rb: 2}, 2)))
    assert(arraysEqual([102,2], deref({memory:[109,2,21001,7,7,100,99,1,1], ip:2, rb: 2}, 3)))
})()

function setParam(state, offset, value) {
    const [address, pmode] = deref(state, offset)
    assert(1 !== pmode)
    poke(state.memory, address, value)
}

export const STATUS_RUNNING = 0
export const STATUS_HALT = -1
export const STATUS_YIELD = -2

const INSTRUCTIONS = {
    1: {
        name: 'ADD',
        length: 4,
        run: (state) => {
            const a = fetch(state, 1)
            const b = fetch(state, 2)
            setParam(state, 3, a + b)
            state.ip += 4
        },
    },
    2: {
        name: 'MUL',
        length: 4,
        run: (state) => {
            const a = fetch(state, 1)
            const b = fetch(state, 2)
            setParam(state, 3, a * b)
            state.ip += 4
        }
    },
    3: {
        name: 'INP',
        length: 2,
        run: (state) => {
            const {input} = state
            let value
            if (typeof input === "function") {
                value = input(state)
            } else {
                if (!input.length) {
                    state.status = STATUS_YIELD
                    return
                }
                value = input.shift()
            }
            setParam(state, 1, value)
            state.ip += 2
        }
    },
    4: {
        name: 'OUT',
        length: 2,
        run: (state) => {
            const {output} = state
            const value = fetch(state, 1)
            if (typeof output === "function") {
                output(value, state)
            }else {
                output.push(value)
            }
            state.ip += 2
        }
    },
    5: {
        name: 'JMPT',
        length: 3,
        run: (state) => {
            const value = fetch(state, 1)
            if (value) {
                state.ip = fetch(state, 2)
            } else {
                state.ip += 3
            }
        }
    },
    6: {
        name: 'JMPF',
        length: 3,
        run: (state) => {
            const value = fetch(state, 1)
            if (!value) {
                state.ip = fetch(state, 2)
            } else {
                state.ip += 3
            }
        }
    },
    7: {
        name: 'LT',
        length: 4,
        run: (state) => {
            const a = fetch(state, 1)
            const b = fetch(state, 2)
            let result = 0
            if (a < b) {
                result = 1
            }
            setParam(state, 3, result)
            state.ip += 4
        }
    },
    8: {
        name: 'EQ',
        length: 4,
        run: (state) => {
            const a = fetch(state, 1)
            const b = fetch(state, 2)
            let result = 0
            if (a === b) {
                result = 1
            }
            setParam(state, 3, result)
            state.ip += 4
        }
    },
    9: {
        name: 'SETRB',
        length: 2,
        run: (state) => {
            state.rb += fetch(state, 1)
            state.ip += 2
        }
    },
    99: {
        name: 'END',
        length: 1,
        run: (state) => {
            state.status = STATUS_HALT
        }
    },
}

export function runProgram(state) {
    assert(state.memory, 'NO MEMORY!')
    state = Object.assign(
        {
            memory:[99], input:[], output:[],
            ip:0, rb:0,
            status:STATUS_RUNNING, name:'?', print:false},
        state
    )
    state.memory = state.memory.slice(0)
    state.status = STATUS_RUNNING

    if (state.print) console.log(`running program ${state.name} input=[${state.input}]`)
    while (state.status === STATUS_RUNNING) {
        const opcode = state.memory[state.ip]
        const instruction = INSTRUCTIONS[opcode % 100]
        assert(instruction,
            `Invalid Opcode ${opcode}
            ip=${state.ip} halting
            input=${state.input}
            output=${state.output}`)
        if (state.print) {printInstruction(state)}
        instruction.run(state)
    }
    return state
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

function testProgram(memory, expected, input = [], expectedOutput = []) {
    const result = runProgram({memory, input, print:false})
    const actual = result.memory
    const actualOutput = result.output

    let expectedProgramsMatch = true
    if (expected) {
        expectedProgramsMatch = arraysEqual(actual, expected)
    }
    assert(
        expectedProgramsMatch && arraysEqual(actualOutput, expectedOutput),
        `runProgram([${memory}])
        Actual   = [${actual}]
        Expected = [${expected}]
        inputs   = [${input}]
        actOut   = [${actualOutput}]
        expOut   = [${expectedOutput}]`)
}

function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}

export function runTests() {
    // Basics
    testProgram([99], [99])
    testProgram([1101,100,-1,4,0], [1101,100,-1,4,99])
    // Day 9 - opcode 9, set rb
    testProgram([109,1,109,1,1201,0,-109,13,1008,13,0,14,99,0,0],[109,1,109,1,1201,0,-109,13,1008,13,0,14,99,0,1])
    testProgram([  9, 7, 22201, 0, 1, 0, 99, 7 ,1], [  9, 7, 22201, 0, 1, 0, 99, 8 ,1])
    testProgram([109, 7, 22201, 0, 1, 0, 99, 1 ,1], [109, 7, 22201, 0, 1, 0, 99, 2 ,1])
    testProgram([209, 7, 22201, 0, 1, 0, 99, 7 ,1], [209, 7, 22201, 0, 1, 0, 99, 8 ,1])
    // duplicate
    testProgram(
        [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99],
        null,
        [],
        [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99])
    testProgram(
        [1102,34915192,34915192,7,4,7,99,0],
        null,
        [],
        [1219070632396864]
    )
    testProgram(
        [104,1125899906842624,99],
        null,
        [],
        [1125899906842624]
    )

    // Resume
    //             [0,1, 2,3, 4,5, 6, 7, 8,9, 10,11,12]
    const resume = [3,11,3,12,1,11,12,11,4,11,99,-1,-1]
    let state
    state = runProgram({memory: resume})
    assert(state.status === STATUS_YIELD)
    state.input = [1]
    state = runProgram(state)
    assert(state.status === STATUS_YIELD)
    state.input = [1]
    state = runProgram(state)
    assert(state.status === STATUS_HALT)
    assert(state.output.pop() === 2, `Didn't get 2`)
    // Unit Tests
    testProgram([3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9], [3,12,6,12,15,1,13,14,13,4,13,99,0,0,1,9], [0], [0])
    testProgram([3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9], [3,12,6,12,15,1,13,14,13,4,13,99,1,1,1,9], [1], [1])
    testProgram([3,3,1105,-1,9,1101,0,0,12,4,12,99,1], [3,3,1105,0,9,1101,0,0,12,4,12,99,0], [0], [0])
    testProgram([3,3,1105,-1,9,1101,0,0,12,4,12,99,1], [3,3,1105,5,9,1101,0,0,12,4,12,99,1], [5], [1])
    // negative #s
    testProgram([1101,100,-1,4,0], [1101,100,-1,4,99])

    const big = [3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99]
    testProgram(big, undefined, [6], [999])
    testProgram(big, undefined, [8], [1000])
    testProgram(big, undefined, [10], [1001])

    // unit tests
    testProgram([3,9,8,9,10,9,4,9,99,-1,8], null, [8], [1])
    testProgram([3,9,8,9,10,9,4,9,99,-1,8], null, [4], [0])
    testProgram([3,9,7,9,10,9,4,9,99,-1,8], null, [7], [1])
    testProgram([3,9,7,9,10,9,4,9,99,-1,8], null, [9], [0])

    testProgram([3,3,1108,-1,8,3,4,3,99], null, [8], [1])
    testProgram([3,3,1108,-1,8,3,4,3,99], null, [4], [0])

    testProgram([3,3,1107,-1,8,3,4,3,99], null, [7], [1])
    testProgram([3,3,1107,-1,8,3,4,3,99], null, [9], [0])

    // jump if true
    testProgram([1105,1,4,99,1101,1,1,0,99], [2,1,4,99,1101,1,1,0,99])
    testProgram([1105,0,4,99,1101,1,1,0,99], [1105,0,4,99,1101,1,1,0,99])
    // jump if false
    testProgram([1106,0,4,99,1101,1,1,0,99], [2,0,4,99,1101,1,1,0,99])
    testProgram([1106,1,4,99,1101,1,1,0,99], [1106,1,4,99,1101,1,1,0,99])
    // Less than opcode 7
    testProgram([7,0,1,0,99], [0,0,1,0,99])
    testProgram([7,0,4,0,99], [1,0,4,0,99])
    testProgram([1107,0,1,0,99], [1,0,1,0,99])

    // Equal
    testProgram([1108,0,1,0,99], [0,0,1,0,99])
    testProgram([1108,1,1,0,99], [1,1,1,0,99])

    testProgram([3,0,4,0,99], [1,0,4,0,99], [1], [1])
    testProgram([1002,4,3,4,33], [1002,4,3,4,99])
    testProgram([1,0,0,0,99], [2,0,0,0,99])
    testProgram([2,3,0,3,99], [2,3,0,6,99])
    testProgram([2,4,4,5,99,0], [2,4,4,5,99,9801])
    testProgram([1,1,1,4,99,5,6,0,99], [30,1,1,4,2,5,6,0,99])
    testProgram([1,9,10,3,2,3,11,0,99,30,40,50], [3500,9,10,70,2,3,11,0,99,30,40,50])
}

runTests()