import { assert } from './util.js'

export function Bitmap() {
    this.map = {}
    this.dim = { l: 0, t: 0, r: 0, b: 0 }

    const posStr = (pos) => `${pos[0]},${pos[1]}`

    this.paint = function (x, y, color) {
        this.dim.l = Math.min(this.dim.l, x)
        this.dim.t = Math.min(this.dim.t, y)
        this.dim.r = Math.max(this.dim.r, x)
        this.dim.b = Math.max(this.dim.b, y)
        this.map[posStr([x, y])] = color
    }

    this.panelsPainted = function () {
        return Object.keys(this.map).length
    }

    this.get = function (x, y) {
        return this.map[posStr([x, y])]
    }

    this.print = function(print) {
        for (let row = this.dim.t; row <= this.dim.b; row++) {
            const pixels = []
            for (let col = this.dim.l; col <= this.dim.r; col++) {
                let v = this.get(col, row)
                if (v === undefined) v = ' '
                pixels.push(''+v)
            }
            print(pixels.join(''))
        }
    }
}

(() => {
    const bitmap = new Bitmap()
    bitmap.paint(0, 0, 1)
    bitmap.paint(1, 1, 1)
    bitmap.paint(2, 2, 1)
    assert(bitmap.panelsPainted() === 3)
    // bitmap.print(console.log)
})()
