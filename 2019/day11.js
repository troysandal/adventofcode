import {runProgram, STATUS_HALT, STATUS_RUNNING} from './intcode.js'

function Robot(startColor = 0) {
    this.map = {}
    this.dim = {l:0,t:0,r:0,b:0}
    this.pos = [0,0]
    this.direction = 0

    const posStr = (pos) => `${pos[0]},${pos[1]}`

    const DIRECTIONS = [
        [0,1],
        [1,0],
        [0,-1],
        [-1,0]
    ]
    
    this.paint = function(color) {
        this.dim.l = Math.min(this.dim.l, this.pos[0])
        this.dim.t = Math.max(this.dim.t, this.pos[1])
        this.dim.r = Math.max(this.dim.r, this.pos[0])
        this.dim.b = Math.min(this.dim.b, this.pos[1])
        this.map[posStr(this.pos)] = color
    }

    this.panelsPainted = function() {
        return Object.keys(this.map).length
    }

    this.turnAndMove = function(direction) {
        direction = (direction === 0) ? -1 : 1
        this.direction = this.direction + direction
        if (this.direction < 0) {
            this.direction = 3
        } else {
            this.direction %= 4
        }
        this.pos[0] += DIRECTIONS[this.direction][0]
        this.pos[1] += DIRECTIONS[this.direction][1]
    }

    this.panelColor = function() {
        return this.map[posStr(this.pos)] || 0
    }

    this.get = function(x, y) {
        return this.map[posStr([x,y])]
    }

    this.print = function() {
        for (let row = this.dim.t ; row >= this.dim.b ; row--) {
            const pixels = []
            for (let col = this.dim.l ; col <= this.dim.r ; col++) {
                pixels.push(this.get(col,row) ? 'X' : ' ')
            }
            console.log(pixels.join(''))
        }        
    }    

    this.paint(startColor)
}
const puzzleInput = [3,8,1005,8,330,1106,0,11,0,0,0,104,1,104,0,3,8,102,-1,8,10,101,1,10,10,4,10,1008,8,0,10,4,10,102,1,8,29,2,9,4,10,1006,0,10,1,1103,17,10,3,8,102,-1,8,10,101,1,10,10,4,10,108,0,8,10,4,10,101,0,8,61,1006,0,21,1006,0,51,3,8,1002,8,-1,10,101,1,10,10,4,10,108,1,8,10,4,10,1001,8,0,89,1,102,19,10,1,1107,17,10,1006,0,18,3,8,1002,8,-1,10,1001,10,1,10,4,10,1008,8,1,10,4,10,1001,8,0,123,1,9,2,10,2,1105,10,10,2,103,9,10,2,1105,15,10,3,8,102,-1,8,10,1001,10,1,10,4,10,1008,8,0,10,4,10,102,1,8,161,3,8,102,-1,8,10,101,1,10,10,4,10,108,1,8,10,4,10,101,0,8,182,3,8,1002,8,-1,10,101,1,10,10,4,10,1008,8,0,10,4,10,101,0,8,205,2,1102,6,10,1006,0,38,2,1007,20,10,2,1105,17,10,3,8,102,-1,8,10,1001,10,1,10,4,10,108,1,8,10,4,10,1001,8,0,241,3,8,102,-1,8,10,101,1,10,10,4,10,108,1,8,10,4,10,101,0,8,263,1006,0,93,2,5,2,10,2,6,7,10,3,8,102,-1,8,10,101,1,10,10,4,10,108,0,8,10,4,10,1001,8,0,296,1006,0,81,1006,0,68,1006,0,76,2,4,4,10,101,1,9,9,1007,9,1010,10,1005,10,15,99,109,652,104,0,104,1,21102,825594262284,1,1,21102,347,1,0,1105,1,451,21101,0,932855939852,1,21101,358,0,0,1106,0,451,3,10,104,0,104,1,3,10,104,0,104,0,3,10,104,0,104,1,3,10,104,0,104,1,3,10,104,0,104,0,3,10,104,0,104,1,21102,1,235152649255,1,21101,405,0,0,1105,1,451,21102,235350879235,1,1,21102,416,1,0,1106,0,451,3,10,104,0,104,0,3,10,104,0,104,0,21102,988757512972,1,1,21101,439,0,0,1106,0,451,21102,1,988669698828,1,21101,0,450,0,1106,0,451,99,109,2,22101,0,-1,1,21102,40,1,2,21102,1,482,3,21102,472,1,0,1106,0,515,109,-2,2105,1,0,0,1,0,0,1,109,2,3,10,204,-1,1001,477,478,493,4,0,1001,477,1,477,108,4,477,10,1006,10,509,1101,0,0,477,109,-2,2106,0,0,0,109,4,1202,-1,1,514,1207,-3,0,10,1006,10,532,21102,1,0,-3,21202,-3,1,1,21202,-2,1,2,21102,1,1,3,21102,1,551,0,1106,0,556,109,-4,2105,1,0,109,5,1207,-3,1,10,1006,10,579,2207,-4,-2,10,1006,10,579,22101,0,-4,-4,1105,1,647,21201,-4,0,1,21201,-3,-1,2,21202,-2,2,3,21102,598,1,0,1105,1,556,21202,1,1,-4,21101,0,1,-1,2207,-4,-2,10,1006,10,617,21102,1,0,-1,22202,-2,-1,-2,2107,0,-3,10,1006,10,639,21202,-1,1,1,21102,1,639,0,105,1,514,21202,-2,-1,-2,22201,-4,-2,-4,109,-5,2105,1,0];

(function partOne() {
    const robot = new Robot()
    let running = true
    let state = {memory:puzzleInput, print:false}

    while (running) {
        state.input = [robot.panelColor()]
        state.output = []
        state = runProgram(state)
        robot.paint(state.output[0])
        robot.turnAndMove(state.output[1])
        running = state.status !== STATUS_HALT
    }
    console.log(`Part One Answer = ${robot.panelsPainted()}`)
    console.assert(2021 === robot.panelsPainted())
})();


(function partTwo() {
    const robot = new Robot(1)
    let state = {memory:puzzleInput, print:false, status: STATUS_RUNNING}

    while (state.status !== STATUS_HALT) {
        state.input = [robot.panelColor()]
        state.output = []
        state = runProgram(state)
        robot.paint(state.output[0])
        robot.turnAndMove(state.output[1])
    }
    robot.print()
    // LBJHEKLH
}());
