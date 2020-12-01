// import fs from 'fs'
// var buffer = new Buffer(1);
// var x = fs.openSync('/dev/stdin', 'rs')
// fs.readSync(x, buffer, 0, 1);
// console.log('read: ' + buffer[0]);

process.stdin.setRawMode(true)
process.stdin.resume();

async function getChar() {
  return new Promise((resolve) => {
    process.stdin.on(
      'data',
      function (chunk) {
        resolve(chunk[0])
      }
    )
  })
}

async function main() {
  const c = await getChar()
  process.stdout.write('char read: ' + c)
  process.exit(0)
}

main()