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


// Thanks https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript
function multiply(b, startRow = 0, numRows = -1) {
    const pattern = [0, 1, 0, -1]
    const aNumRows = (numRows !== -1) ? numRows : b.numRows
    const aNumCols = b.numRows
    const bNumCols = b.numCols
    const result = new Array(aNumRows - startRow)
    
    for (var row = startRow; row < aNumRows; ++row) {
        result[row - startRow] = new Array(bNumCols).fill(0)
        for (var col = 0; col < bNumCols; ++col) {
            for (var tcol = row; tcol < aNumCols; ++tcol) {
                result[row - startRow][col] += 
                    pattern[Math.floor((tcol + 1) / (row+1)) % 4] * b.get(tcol, col)
            }
        }
    }
    return result;
}



function toVector(input) {
    return input.split('').map((v) => [v.charCodeAt(0) - 48])
}

function patternMatrix(length) {
    const rows = []
    for (let rowIx = 0 ; rowIx < length ; rowIx++) {
        rows[rowIx] = makePattern(length, rowIx)
    }
    return rows
}

function getBase(r, c, pattern = [0, 1, 0, -1]) {
    const ix = Math.floor(c / (r+1))
    return pattern[ix % pattern.length]
}

(() => {
    function testBase(r, c, e) {
        const a = getBase(r, c)
        console.assert(a === e, `getBase(${r}, ${c}) returned ${a}, expected ${e}`)
    }
    testBase(0, 0, 0)
    testBase(0, 1, 1)
    testBase(0, 2, 0)
    testBase(0, 3, -1)
    testBase(0, 4, 0)

    testBase(1, 0, 0)
    testBase(1, 1, 0)
    testBase(1, 2, 1)
    testBase(1, 3, 1)
})();

function makePattern(length, rowIx) {
    const result = []
    for (let col = 0 ; col < length ; col++) {
        result[col] = getBase(rowIx, col + 1)
    }
    return result
}

(() => {
    function test(length, n, expected) {
        const actual = makePattern(length, n)
        console.assert(JSON.stringify(actual) === JSON.stringify(expected), `${actual} !== ${expected}`)
    }
    test(8, 0, [1,0,-1,0,1,0,-1,0])
    const longerTest = [0, 1, 1, 0, 0, -1, -1, 0, 0, 1, 1, 0, 0, -1, -1]
    test(longerTest.length, 1, longerTest)    
})();

function fft(input) {
    let matrix = input
    if (matrix.length) {
        matrix = {
            numRows: input.length,
            numCols: input[0].length,
            get:(r,c) => input[r][c]
        }
    }
    return multiply(matrix).map((v) => v = [Math.abs(v[0] % 10)])
}

const puzzleInput = '59769638638635227792873839600619296161830243411826562620803755357641409702942441381982799297881659288888243793321154293102743325904757198668820213885307612900972273311499185929901117664387559657706110034992786489002400852438961738219627639830515185618184324995881914532256988843436511730932141380017180796681870256240757580454505096230610520430997536145341074585637105456401238209187118397046373589766408080120984817035699228422366952628344235542849850709181363703172334788744537357607446322903743644673800140770982283290068502972397970799328249132774293609700245065522290562319955768092155530250003587007804302344866598232236645453817273744027537630';

(() => {
    function testFFT(input, expected, phases) {
        input = toVector(input)
        expected = toVector(expected)
        let actual
        let nextInput = input
        for (let phase = 0 ; phase < phases ; phase++) {
            actual = fft(nextInput)
            nextInput = actual
        }
        const actualSliced = actual.slice(0, expected.length)
        assert(arraysEqual(actualSliced, expected), `Actual ${actualSliced} !== ${expected}`)
    }

    testFFT('12345678', '48226158', 1)
    testFFT('48226158', '34040438', 1)
    testFFT('12345678', '34040438', 2)
    testFFT('12345678', '03415518', 3)
    testFFT('12345678', '01029498', 4)

    testFFT('80871224585914546619083218645595', '24176176', 100)
    testFFT('19617804207202209144916044189917', '73745418', 100)
    testFFT('69317163492948606335995924319873', '52432133', 100)

    testFFT(puzzleInput, '29956495', 100)
    console.log('Part One Answer 29956495')
})();

/*
--- Part Two ---
Now that your FFT is working, you can decode the real signal.

The real signal is your puzzle input repeated 10000 times. Treat this new signal
as a single input list. Patterns are still calculated as before, and 100 phases
of FFT are still applied.

The first seven digits of your initial input signal also represent the message
offset. The message offset is the location of the eight-digit message in the
final output list. Specifically, the message offset indicates the number of
digits to skip before reading the eight-digit message. For example, if the first
seven digits of your initial input signal were 1234567, the eight-digit message
would be the eight digits after skipping 1,234,567 digits of the final output
list. Or, if the message offset were 7 and your final output list were 
98765432109876543210, the eight-digit message would be 21098765. (Of course,
your real message offset will be a seven-digit number, not a one-digit
number like 7.)

Here is the eight-digit message in the final output list after 100 phases. The
message offset given in each input has been highlighted. (Note that the inputs
given below are repeated 10000 times to find the actual starting input
lists.)

03036732577212944063491565474664 becomes 84462026.
02935109699940807407585447034323 becomes 78725270.
03081770884921959731165446850517 becomes 53553731.
*/

(() => {
    function getMessage(input) {
        sliceFromPattern(offset, 8, input)
    }

    function testFFT2(input, expected, phases = 100) {
        const INPUT_LENGTH = input.length * 10000
        const offset = parseInt(sliceFromPattern(0, 7, input))
        let resultVector = []
        for (let j = offset ; j < INPUT_LENGTH ; j++) {
            resultVector[j - offset] = parseInt(getCharFromPattern(j, input))
        }
        for (let phase = 0 ; phase < phases ; phase++) {
            let accum = 0
            for (let j = offset ; j < INPUT_LENGTH ; j++) {
                assert(1 === getBase(offset, offset + 1), `1 !== getBase(offset, offset + 1) === ${getBase(offset, offset + 1)}`)
                accum += resultVector[j - offset]
            }
            for (let j = offset ; j < INPUT_LENGTH ; j++) {
                const old = resultVector[j - offset]
                resultVector[j - offset] = Math.abs(accum % 10)
                accum -= old
            }
            resultVector.map((v) => v = [Math.abs(v[0] % 10)])
        }
        const actual = resultVector.slice(0, 8).join('')
        assert(actual === expected, `${actual} !== ${expected}`)
    }

    function sliceFromPattern(start, length, pattern) {
        let slice = ''
        for (let i = start ; i < (start + length) ; i++) {
            slice += getCharFromPattern(i, pattern)
        }
        return slice
    }

    function getCharFromPattern(nth, pattern) {
        return pattern[nth % pattern.length]
    }
    
    function setCharInPattern(c, nth, pattern) {
        pattern[nth % pattern.length] = c
    }

    testFFT2('03036732577212944063491565474664', '84462026')
    testFFT2('02935109699940807407585447034323', '78725270')
    testFFT2('03081770884921959731165446850517', '53553731')
    /*
    After repeating your input signal 10000 times and running 100 phases of FFT,
    what is the eight-digit message embedded in the final output list?
    */
    testFFT2(puzzleInput, '73556504')
    console.log('Part 2 Answer 73556504')
    })();


