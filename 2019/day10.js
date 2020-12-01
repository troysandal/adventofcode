/* day10.js

a = A is the set of asteroids. Every asteroid is small, at center of grid point.
an = (an.x, an.y)

lineOfSight(an) ; # of asteroid in line of sight of an

For every an, find Max(lineOfSight(an)) 

Ex 1: Answer is A = 4,5 
.#..#
.....
#####
....#
...A#

Idea 1: 

Should we double the board?  Why do I think this is smart?  Because...pixels?

 Idea 2: 
    Draw a line between them all in cartesian space, adding 0.5 to each asteroid coordinate,
    and see if anyone else is on that line? Brute force, very slow.
 Idea 3: 
    Use polar coords, find ray to each asteroid, any with same angle are blocked if not nearest

    r = √ ( x2 + y2 )
    θ = tan-1 ( y / x )
*/
const RAD2PI = 360/(2*Math.PI)
const DEG360 = (2*Math.PI)/360
function rad2deg(rad) { return rad * RAD2PI}
function deg2rad(deg) { return deg * DEG360}

function ptEquals(a, b) {
    return a.x === b.x && a.y == b.y
}

function cartesianToPolar(x, y) {
    return {r:Math.sqrt(x**2 + y**2), angle: Math.atan2(y,x)}
}

function testcar2Polar(pt, expected) {
    const actual = cartesianToPolar(pt[0], pt[1])
    assert(
        actual.r === expected.r && actual.angle === expected.angle,
        `${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`)
}
testcar2Polar([1,1], {r:Math.sqrt(2), angle:deg2rad(45)})
testcar2Polar([1,0], {r:1, angle:deg2rad(0)})
testcar2Polar([0,1], {r:1, angle:deg2rad(90)})
testcar2Polar([-1,0], {r:1, angle:deg2rad(180)})
testcar2Polar([0,-1], {r:1, angle:deg2rad(-90)})

function vector(from, to) {
    return cartesianToPolar(to.x - from.x, to.y - from.y)
}

function testVector(from, to, expected) {
    const actual = vector(from, to)
    assert(
        actual.r === expected.r && actual.angle === expected.angle,
        `${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`)
}
testVector({x:0,y:0}, {x:1,y:1}, {r:Math.sqrt(2), angle:deg2rad(45)})
testVector({x:1,y:1}, {x:2,y:2}, {r:Math.sqrt(2), angle:deg2rad(45)})

function parseMap(map) {
    return map.split('\n')
        .map((row) => row.trim().split(''))
        .map((row, y) => 
            row.map((c, x) => (c !== '.') ? {x,y}: 0)
                .filter((c) => c)
        )
        .reduce((p, row) => p.concat(row), [])
} 

function findBestLineOfSight(map) {
    const asteroids = parseMap(map)
    const forDebugging = asteroids
        .map((from) => {
            return asteroids
                .map((to) => vector(from, to))
                .reduce((m,v) => {
                    if (v.r) {
                        m[v.angle] = v
                    }
                    return m
                }, {})
        }).reduce((m, i, ix) => {
            m[`${asteroids[ix].x},${asteroids[ix].y}`] = {len:Object.keys(i).length, source:asteroids[ix], others:i}
            return m
        }, {})
    const angleMaps = asteroids.map((from) => {
        const angleMaps = asteroids
            // Get a vector to every other asteroid in the system
            .map((to) => ({vector:vector(from, to), coords:to}))
            // Reduce to Set(theta, [asteroids])
            .reduce((angleMap, asteroid) => {
                if (asteroid.vector.r) {
                    if (!angleMap[asteroid.vector.angle]) {
                        angleMap[asteroid.vector.angle] = []
                    }
                    angleMap[asteroid.vector.angle].push(asteroid)
                }
                return angleMap
            }, {})
        // Sort asteroids at given angle by distance (nearest to farthest)
        for (const asteroids of Object.values(angleMaps)) {
            asteroids.sort((a,b) => a.vector.r - b.vector.r)
        }
        // Object.values(angleMaps).forEach((asteroids) => asteroids.sort((a,b) => a.r - b.r))
        return angleMaps
    })
    // [Set(theta, [asteroids]), ...].reduce() : {coords, total}
    // returns best location
    return angleMaps.reduce((best, current, ix) => {
        if (Object.keys(current).length > best.total) {
            best.total = Object.keys(current).length
            best.coords = asteroids[ix]
            best.angleMap = angleMaps[ix]
        }
        return best
    }, {total:-1})
}
function test(map, expected) {
    const actual = findBestLineOfSight(map)
    assert(ptEquals(expected.coords, actual.coords), `${expected.coords} != ${actual.coords}`)
    assert(actual.total===expected.total, `${actual.total} != ${expected.total}`)
}

test(`.#..#
      .....
      #####
      ....#
      ...##`,
      {coords:{x:3,y:4}, total:8})

test(`......#.#.
#..#.#....
..#######.
.#.#.###..
.#..#.....
..#....#.#
#..#....#.
.##.#..###
##...#..#.
.#....####`,{coords:{x:5,y:8}, total:33})

test(`#.#...#.#.
.###....#.
.#....#...
##.#.#.#.#
....#.#.#.
.##..###.#
..#...##..
..##....##
......#...
.####.###.`,{coords:{x:1,y:2}, total:35})

test(`.#..#..###
####.###.#
....###.#.
..###.##.#
##.##.#.#.
....###..#
..#.#..#.#
#..#.#.###
.##...##.#
.....#.#..`,{coords:{x:6,y:3}, total:41})

const MAP_11X13 = `.#..##.###...#######
##.############..##.
.#.######.########.#
.###.#######.####.#.
#####.##.#.##.###.##
..#####..#.#########
####################
#.####....###.#.#.##
##.#################
#####.##.###..####..
..######..##.#######
####.##.####...##..#
.#####..#.######.###
##...#.##########...
#.##########.#######
.####.#.###.###.#.##
....##.##.###..#####
.#.#.###########.###
#.#.#.#####.####.###
###.##.####.##.#..##`

test(MAP_11X13, {coords:{x:11,y:13}, total:210})

const puzzleInput = `#.#................#..............#......#......
    .......##..#..#....#.#.....##...#.........#.#...
    .#...............#....#.##......................
    ......#..####.........#....#.......#..#.....#...
    .....#............#......#................#.#...
    ....##...#.#.#.#.............#..#.#.......#.....
    ..#.#.........#....#..#.#.........####..........
    ....#...#.#...####..#..#..#.....#...............
    .............#......#..........#...........#....
    ......#.#.........#...............#.............
    ..#......#..#.....##...##.....#....#.#......#...
    ...#.......##.........#.#..#......#........#.#..
    #.............#..........#....#.#.....#.........
    #......#.#................#.......#..#.#........
    #..#.#.....#.....###..#.................#..#....
    ...............................#..........#.....
    ###.#.....#.....#.............#.......#....#....
    .#.....#.........#.....#....#...................
    ........#....................#..#...............
    .....#...#.##......#............#......#.....#..
    ..#..#..............#..#..#.##........#.........
    ..#.#...#.......#....##...#........#...#.#....#.
    .....#.#..####...........#.##....#....#......#..
    .....#..#..##...............................#...
    .#....#..#......#.#............#........##...#..
    .......#.....................#..#....#.....#....
    #......#..###...........#.#....#......#.........
    ..............#..#.#...#.......#..#.#...#......#
    .......#...........#.....#...#.............#.#..
    ..##..##.............#........#........#........
    ......#.............##..#.........#...#.#.#.....
    #........#.........#...#.....#................#.
    ...#.#...........#.....#.........#......##......
    ..#..#...........#..........#...................
    .........#..#.......................#.#.........
    ......#.#.#.....#...........#...............#...
    ......#.##...........#....#............#........
    #...........##.#.#........##...........##.......
    ......#....#..#.......#.....#.#.......#.##......
    .#....#......#..............#.......#...........
    ......##.#..........#..................#........
    ......##.##...#..#........#............#........
    ..#.....#.................###...#.....###.#..#..
    ....##...............#....#..................#..
    .....#................#.#.#.......#..........#..
    #........................#.##..........#....##..
    .#.........#.#.#...#...#....#........#..#.......
    ...#..#.#......................#...............#`

const part1 = findBestLineOfSight(puzzleInput)
console.log(`Part One Answer = ${part1.total}`)
assert(part1.total === 309)
assert(ptEquals({x:37,y:25}, part1.coords))

/**
// Part II  Vaporization
// Starting at angle of PI/2 move in clockwise direction, removing nearest asteroid,
// repeat until no asteroids are found in a rotation.
//

Idea - create a 2d sorted table of angles, each angle a list of the asteroids
    at that angle.

    [
        [ A G X ],
        [ Z     ],
        [ F B   ]
    ]
    then you just walk the columns, A, Z, F, G, B, X done.

table = map(asteroids) => [{angle - PI/2} => [asteroid].sort(distance)]
for (0 <= i < table.length) {

}
*/

function testPart2() {
    function test(map, answers) {
        const best = findBestLineOfSight(map)
        const vapeOrder = getVaporizationList(best)
        for (const N of Object.keys(answers)) {
            const answer = answers[N]
            assert(ptEquals(answer, vapeOrder[N-1].coords), `${N}: ${answer} !== ${vapeOrder[answer]}`)
        }
    }
    test(
     `.1.
      4X2
      .3.`,
      {1:{x:1,y:0}, 2:{x:2,y:1}, 3:{x:1,y:2}, 4:{x:0,y:1}})

    const answers = {
        1:      {x:11,y:12},
        2:      {x:12,y:1},
        3:      {x:12,y:2},
        10:     {x:12,y:8},
        20:     {x:16,y:0},
        50:     {x:16,y:9},
        100:    {x:10,y:16},
        199:    {x:9,y:6},
        200:    {x:8,y:2},
        201:    {x:10,y:9},
        299:    {x:11,y:1}
    }
    test(MAP_11X13, answers)
}

function assert(condition, message) {
    if (!condition) {
        debugger
        console.log(message)
    }
}

function getVaporizationList(best) {
    function adjustAngle(angle) {
        // convert from atan2 angles of 0 -> PI and 0 -> -PI to [0, 2PI]
        if (angle < 0) {
            angle += (2 * Math.PI)
        }
        assert(angle >= 0 && angle <= (2*Math.PI))

        // rotate by PI/2 so up is now 0
        angle = angle - 3*Math.PI / 2
        if (angle < 0) { 
            angle += 2*Math.PI
        }

        return angle
    }
    assert(adjustAngle(-Math.PI/2) === 0)
    assert(adjustAngle(Math.PI/2) === Math.PI)
    assert(adjustAngle(0) === Math.PI/2)
    
    // adjust all angles so that Math.PI/2 is now at zero and
    let rotations = 0
    const angleList = Object.keys(best.angleMap).map((angle) => {
        rotations = Math.max(rotations, best.angleMap[angle].length)
        return {
            angle: adjustAngle(parseFloat(angle)), 
            // oAng: rad2deg(parseFloat(angle)),
            // nAng: rad2deg(adjustAngle(parseFloat(angle))),
            asteroids:best.angleMap[angle]
        }
    })
    // angles are normalized for Up being 0
    angleList.sort((a,b) => a.angle - b.angle)
    // sorted list from 0 now in clockwise asteroid order
    console.log(`rotations = ${rotations}`)
    let totalVaped = 0
    let vaped = []
    for (let rotation = 0 ; rotation < rotations; rotation++) {
        const toVape = angleList.map((v) => v.asteroids[rotation]).filter((v) => v)
        vaped = [...vaped, ...toVape]
        console.log(`Rotation ${rotation} found ${toVape.length} asteroids`)
        totalVaped += toVape.length
    }
    console.log(`We vaped ${totalVaped} asteroids`)
    return vaped
}
function part2() {
    testPart2()

    // find best from puzzle input
    const best = findBestLineOfSight(puzzleInput)
    // get list of all asteroids
    const vapeOrder = getVaporizationList(best)
    const asteroid = vapeOrder[200-1].coords
    const answer = asteroid.x * 100 + asteroid.y
    console.log(`Part Two Answer = ${answer}`)
    console.assert(416 === answer)
}

part2()