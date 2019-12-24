// day16.js - Flawed Frequency Transmission

function assert(condition, message) {
    if (!condition) {
        console.log(message)
        debugger
    }
}

function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}

// https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript
function multiply(a, b) {
    // console.log(`a := ${a.length} x ${a[0].length}`)
    // console.log(`b := ${b.length} x ${b[0].length}`)
    // console.log(`  => ${a.length} x ${b[0].length}`)
    assert(a[0].length === b.length, `Cannot multiple  ${a.length} x ${a[0].length} by ${b.length} x ${b[0].length}`)
    var aNumRows = a.length, aNumCols = a[0].length,
        bNumRows = b.length, bNumCols = b[0].length,
        m = new Array(aNumRows);  // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;             // initialize the current cell
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
};

(() => {
    function drawMatrix(m, title) {
        if (title) console.log(title)
        for (var r = 0; r < m.length; ++r) {
            console.log(m[r].join(' '))
        }
    }

    function test(a, b, expected) {
        const actual = multiply(a, b)
        // drawMatrix(a, 'matrix a:')
        // drawMatrix(b, 'matrix b:')
        // drawMatrix(actual, 'a * b =')
        assert(JSON.stringify(actual) === JSON.stringify(expected), `Whoops`)
    }
    test(
        [[8, 3], [2, 4], [3, 6]], 
        [[1, 2, 3], [4, 6, 8]], 
        [[20, 34, 48], [18, 28, 38], [27, 42, 57]]
    )
    test(
        [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ],
        [[1], [2], [3]],
        [[1], [2], [3]]
    )
})();
  
function toVector(input) {
    return input.split('').map((v) => [v.charCodeAt(0) - 48])
}

function generatePhases(length) {
    const phases = []
    for (let phase = 0 ; phase < length ; phase++) {
        phases[phase] = (new Array(length)).fill(0)
        phases[phase][phase] = 1
    }
    return phases
}

function fft(input, numPhases) {
    const phases = generatePhases(input.length)
    console.log(phases)
    const result = multiply(phases, input)
    console.log(result)
    return result
}

function test(input, expected, phases) {
    input = toVector(input)
    expected = toVector(expected)
    const actual = fft(input, phases)
    assert(arraysEqual(actual, expected), `Actual ${actual} !== ${expected}`)
}

test('12345678', '48226158', 1)
// test('48226158', '34040438', 1)
// test('12345678', '34040438', 2)
// test('12345678', '03415518', 3)
// test('12345678', '01029498', 4)

// test('80871224585914546619083218645595', '24176176', 100)
// test('19617804207202209144916044189917', '73745418', 100)
// test('69317163492948606335995924319873', '52432133', 100)
