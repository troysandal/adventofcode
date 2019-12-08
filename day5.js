// day5.js - Intcode Computer

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
            assert(inputs.length, 'OUT OF INPUTS!')
            const input = inputs[0]
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
        run: (program, pc) => NaN
    },
}

function runProgram(program, input = []) {
    const memory = program.slice(0)
    console.log('running program....')
    const output = []
    let ip = 0
    while (ip < memory.length) {
        opcode = memory[ip]
        const instruction = INSTRUCTIONS[opcode % 100]
        assert(instruction,
            `Invalid Opcode ${opcode}
            ip=${ip} halting
            input=${input}
            output=${output}`)
        printInstruction({memory, ip})
        ip = instruction.run(memory, ip, input, output)
    }
    return [memory, output]
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
    const [actual, actualOutput] = runProgram(program, input)
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
    testDepth([99], [99])
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
    3,225,1,225,6,6,1100,1,238,225,104,0,1102,72,20,224,1001,224,-1440,224,4,224,102,8,223,223,1001,224,5,224,1,224,223,223,1002,147,33,224,101,-3036,224,224,4,224,102,8,223,223,1001,224,5,224,1,224,223,223,1102,32,90,225,101,65,87,224,101,-85,224,224,4,224,1002,223,8,223,101,4,224,224,1,223,224,223,1102,33,92,225,1102,20,52,225,1101,76,89,225,1,117,122,224,101,-78,224,224,4,224,102,8,223,223,101,1,224,224,1,223,224,223,1102,54,22,225,1102,5,24,225,102,50,84,224,101,-4600,224,224,4,224,1002,223,8,223,101,3,224,224,1,223,224,223,1102,92,64,225,1101,42,83,224,101,-125,224,224,4,224,102,8,223,223,101,5,224,224,1,224,223,223,2,58,195,224,1001,224,-6840,224,4,224,102,8,223,223,101,1,224,224,1,223,224,223,1101,76,48,225,1001,92,65,224,1001,224,-154,224,4,224,1002,223,8,223,101,5,224,224,1,223,224,223,4,223,99,0,0,0,677,0,0,0,0,0,0,0,0,0,0,0,1105,0,99999,1105,227,247,1105,1,99999,1005,227,99999,1005,0,256,1105,1,99999,1106,227,99999,1106,0,265,1105,1,99999,1006,0,99999,1006,227,274,1105,1,99999,1105,1,280,1105,1,99999,1,225,225,225,1101,294,0,0,105,1,0,1105,1,99999,1106,0,300,1105,1,99999,1,225,225,225,1101,314,0,0,106,0,0,1105,1,99999,1107,677,226,224,1002,223,2,223,1005,224,329,101,1,223,223,7,677,226,224,102,2,223,223,1005,224,344,1001,223,1,223,1107,226,226,224,1002,223,2,223,1006,224,359,1001,223,1,223,8,226,226,224,1002,223,2,223,1006,224,374,101,1,223,223,108,226,226,224,102,2,223,223,1005,224,389,1001,223,1,223,1008,226,226,224,1002,223,2,223,1005,224,404,101,1,223,223,1107,226,677,224,1002,223,2,223,1006,224,419,101,1,223,223,1008,226,677,224,1002,223,2,223,1006,224,434,101,1,223,223,108,677,677,224,1002,223,2,223,1006,224,449,101,1,223,223,1108,677,226,224,102,2,223,223,1006,224,464,1001,223,1,223,107,677,677,224,102,2,223,223,1005,224,479,101,1,223,223,7,226,677,224,1002,223,2,223,1006,224,494,1001,223,1,223,7,677,677,224,102,2,223,223,1006,224,509,101,1,223,223,107,226,677,224,1002,223,2,223,1006,224,524,1001,223,1,223,1007,226,226,224,102,2,223,223,1006,224,539,1001,223,1,223,108,677,226,224,102,2,223,223,1005,224,554,101,1,223,223,1007,677,677,224,102,2,223,223,1006,224,569,101,1,223,223,8,677,226,224,102,2,223,223,1006,224,584,1001,223,1,223,1008,677,677,224,1002,223,2,223,1006,224,599,1001,223,1,223,1007,677,226,224,1002,223,2,223,1005,224,614,101,1,223,223,1108,226,677,224,1002,223,2,223,1005,224,629,101,1,223,223,1108,677,677,224,1002,223,2,223,1005,224,644,1001,223,1,223,8,226,677,224,1002,223,2,223,1006,224,659,101,1,223,223,107,226,226,224,102,2,223,223,1005,224,674,101,1,223,223,4,223,99,226
]

function main() {
    console.log('Testing...')
    runTests()

    console.log('Part One')
    let [, answer1] = runProgram(puzzleInput, [1])
    console.log(`part 1 answer = ${answer1.pop()}`)
    // Answer: 11933517

    console.log('Part Two')
    let [, answer2] = runProgram(puzzleInput, [5])
    console.log(`part 1 answer = ${answer2.pop()}`)
    // answer: 10428568
    console.log('done')
}

main()
