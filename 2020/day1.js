import {assert, arraysEqual} from './utils.js'

/* day1.js

The Elves in accounting just need you to fix your expense report
(your puzzle input); apparently, something isn't quite adding up. Specifically,
they need you to find the two entries that sum to 2020 and then multiply those
two numbers together.

For example, suppose your expense report contained the following:
*/

const example = [
    1721,
    979,
    366,
    299,
    675,
    1456
]
/*
    In this list, the two entries that sum to 2020 are 1721 and 299. Multiplying
    them together produces 1721 * 299 = 514579, so the correct answer is 514579.
*/


// Pair Generation

function generatePairs(array, visitor) {
  if (visitor) {
    for (let leftIx = 0 ; leftIx < (array.length - 1) ; leftIx++) {
        for (let rightIx = leftIx + 1; rightIx < array.length ; rightIx++) {
          const pair = [array[leftIx], array[rightIx]]
          const result = visitor(pair)
          if (result) {
            return result
          }
        }
    }
  }
}

function pairs(array) {
  const result = []
  generatePairs(array, (pair) => { result.push(pair) })
  return result
}


(() => {
    function testPairs(input, expected) {
        const actual = pairs(input)
        assert(arraysEqual(actual, expected))
    }
    testPairs(['a'], [])
    testPairs(['a','b'], [['a','b']])
    testPairs(
        ['a','b','c','d'],
        [['a','b'], ['a','c'], ['a','d'], ['b','c'], ['b','d'], ['c','d']]
    )
})();

// Part 1 - Expense Report Fix

function testExpense(input, expected) {
    const actual = findExpensesThatSumTo(input, 2020)
    console.assert(expected === actual, `Expected ${expected} !== ${actual}`)
}

testExpense(example, 514579)

function findExpensesThatSumTo(input, sum) {
    return generatePairs(input, (pair) => {
      const accum = pair[0] + pair[1]

      if (sum === accum) {
        return pair[0] * pair[1]
      }
    })
  }


const actualExpenses = [1509,
  1857,
  1736,
  1815,
  1576,
  1970,
  1567,
  1778,
  1508,
  1833,
  1377,
  1890,
  1375,
  1396,
  1102,
  1639,
  1818,
  1469,
  1138,
  1333,
  1906,
  1557,
  1686,
  1712,
  1990,
  1930,
  1761,
  1881,
  1551,
  1627,
  1801,
  1728,
  1960,
  1407,
  1832,
  1842,
  1393,
  1870,
  1295,
  1528,
  251,
  1945,
  1589,
  1850,
  1650,
  1793,
  1997,
  1758,
  1477,
  1697,
  1081,
  1825,
  1899,
  1171,
  1104,
  1839,
  1974,
  1630,
  1831,
  1671,
  1723,
  1811,
  1489,
  1647,
  1486,
  1107,
  1786,
  1680,
  1942,
  1640,
  1112,
  1703,
  1315,
  1769,
  1966,
  997,
  2010,
  1635,
  1196,
  383,
  1986,
  1860,
  1743,
  1756,
  1555,
  1111,
  1823,
  48,
  1953,
  1083,
  1804,
  1933,
  1626,
  1895,
  1807,
  1669,
  1783,
  389,
  1821,
  1883,
  1114,
  1587,
  1941,
  1725,
  1646,
  456,
  1550,
  1939,
  1975,
  1324,
  1201,
  1018,
  1001,
  1402,
  1885,
  1481,
  1633,
  1781,
  1622,
  1822,
  1559,
  1696,
  1510,
  1251,
  1732,
  1790,
  1813,
  1695,
  1121,
  704,
  1964,
  1984,
  1763,
  1656,
  1183,
  1771,
  1276,
  1764,
  1810,
  1992,
  1213,
  1840,
  1318,
  1965,
  1943,
  1549,
  1768,
  1506,
  1949,
  1739,
  1852,
  1787,
  1570,
  1988,
  1357,
  1909,
  1837,
  561,
  1994,
  1777,
  1547,
  1925,
  1897,
  1817,
  1677,
  1668,
  1982,
  1667,
  1753,
  1041,
  1826,
  1961,
  1797,
  1765,
  1720,
  1835,
  1688,
  1705,
  1744,
  1977,
  1971,
  1775,
  1782,
  1661,
  1385,
  1162,
  1755,
  1846,
  1674,
  1698,
  1882,
  1766,
  1820,
  1531,
  1577,
  1710,
  1382,
  1246,
  1864,
  1702]

const part1Answer = findExpensesThatSumTo(actualExpenses, 2020)
assert(part1Answer === 444019, "You broke part 1")
console.log(`Part 1 Answer is ${part1Answer}`)

// Part 2 - Triplets
console.log("")
console.log("Part 2")

function generateTriplets(array, visitor) {
  if (visitor) {
    for (let i = 0 ; i < array.length - 2 ; i++) {
      for (let j = i + 1 ; j < array.length - 1 ; j++) {
        for (let k = j + 1 ; k < array.length ; k++) {
          const triplet = [array[i], array[j], array[k]]
          const rc = visitor(triplet)
          if (rc) {
            return rc
          }
        }
      }
    }
  }
}

function triplets(array) {
  const result = []
  generateTriplets(array, (triplet) => {result.push(triplet)})
  return result
}

(() => {
    function testTriplets(input, expected) {
        const actual = triplets(input)
        assert(arraysEqual(actual, expected), `Input = ${input}\nExpected ${JSON.stringify(expected)} !== ${JSON.stringify(actual)}`)
    }
    testTriplets([1], [])
    testTriplets([1,2], [])
    testTriplets(
        [1,2,3,4],
        [
            [1,2,3], [1,2,4], [1,3,4],
            [2,3,4]
        ]
    )
    testTriplets(
        [1,2,3,4,5],
        [
            [1,2,3], [1,2,4], [1,2,5],
            [1,3,4], [1,3,5],
            [1,4,5],

            [2,3,4], [2,3,5],
            [2,4,5],

            [3,4,5]]
    )
})()


function testExpenseTriplets(input, expected) {
    const actual = findExpenseTripletsThatSumTo(input, 2020)
    console.assert(expected === actual, `Triplets:Expected ${expected} !== ${actual}`)
}

testExpenseTriplets(example, 241861950)


function findExpenseTripletsThatSumTo(input, sum) {
    return generateTriplets(input, (triple) => {
      const accum = triple[0] + triple[1] + triple[2]

      if (sum === accum) {
          return triple[0] * triple[1] * triple[2]
      }
    })

  }

const part2Answer = findExpenseTripletsThatSumTo(actualExpenses, 2020)
console.assert(part2Answer === 29212176, "You broke part 2")
console.log(`Part 2 Answer is ${part2Answer}`)

console.log('DONE')


