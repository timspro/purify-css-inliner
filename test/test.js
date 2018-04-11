let purify = require('purify-css'),
  inliner = require('../src/purifycssinliner')(purify),
  assert = require('assert'),
  fs = require('fs')

try { fs.mkdirSync(`${__dirname}/output`) } catch(err) {}
try { fs.mkdirSync(`${__dirname}/expected`) } catch(err) {}

describe('purify css inliner', function() {
  it('should work via library', function(done) {
    inliner(`${__dirname}/test1/index.html`, (output) => {
      fs.writeFileSync(`${__dirname}/output/normal.html`, output)

      let expected = fs.readFileSync(`${__dirname}/expected/normal.html`)
      assert.equal(output, expected.toString())
      done()
    })
  })
  it('should work via command line', function() {
    let command = `node ${__dirname}/../bin/purifycssinliner ${__dirname}/test1/index.html`,
      output = require('child_process').execSync(command)

    fs.writeFileSync(`${__dirname}/output/command.html`, output)

    let expected = fs.readFileSync(`${__dirname}/expected/normal.html`)
    assert.equal(output, expected.toString())
  })
  /*
  it('should work in production', function(done) {
    fs.readdir(`${__dirname}/test2/`, (err, files) => {
      let count = 0
      for(let file of files) {
        if(file.substring(file.lastIndexOf('.')) === '.html') {
          count++
          inliner(`${__dirname}/test2/${file}`, (output) => {
            fs.writeFileSync(`${__dirname}/output/_${file}`, output)

            try {
              let expected = fs.readFileSync(`${__dirname}/expected/_${file}`)
              console.log(`checking ${file}`)
              assert.equal(output, expected.toString())
            } catch(err) {
              if(err.code === 'ENOENT') console.log(`nothing expected for ${file}`)
              else assert(false, `comparison failed for ${file}`)
            }
            count--
            if(count === 0) done()
          })
        }
      }
    })
  })
  */
})