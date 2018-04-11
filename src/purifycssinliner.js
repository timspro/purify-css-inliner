let fs = require('fs')

let log = (thing) => { console.log(thing); return thing }
module.exports = (purify) => (filename, callback) => {
  let dirname = require('path').dirname(filename),
    html = fs.readFileSync(filename).toString()

  let request = require('request'),
    cached = require('cached-request')(request),
    cheerio = require('cheerio'),
    $ = cheerio.load(html)

  cached.setCacheDirectory('/tmp/critical_cache')

  let final = '', count = 0, found = 0
  $('head link').each((i, thing) => {
    if(thing.attribs.rel !== 'stylesheet') return
    let href = thing.attribs.href
    final += `  @import "${href}";\n`
    count++
    if(href.substring(0, 2) === '//') {
      cached({ttl: 2000, url: `http://${href.substring(2)}`}, doit(found))
    } else if(href.substring(0, 4) === 'http') {
      cached({ttl: 2000, url: href}, doit(found))
    } else {
      if(href[0] === '/') href = href.substring(1)
      if(href.indexOf('?') >= 0) href = href.substring(0, href.indexOf('?'))
      fs.readFile(`${dirname}/${href}`, doit(found))
    }
    found++
  })

  if(found === 0) {
    console.error('warning: did not find link tags')
    callback(html)
  }

  let css = [], fonts = ''
  function doit(index) { return (error, output) => {
    if(error) {
      console.error(`warning: could not resolve stylesheet: ${error.message || error}`)
    } else {
      output = (output.body || output).toString()
      css[index] = `${output}\n`
      let regex = /@import url\(https:\/\/fonts\.googleapis\.com\/css\?family=[a-zA-Z0-9\+\:\,]+\);/g
      output.replace(regex, (match) => {
        fonts += `  ${match}\n`
      })
    }

    count--
    if(count !== 0) return

    if(fonts) $('head').append(`<style>\n${fonts}</style>\n`)
    if(final) $('body').append(`<style>\n${final}</style>\n`)
    $('head link').each((i, thing) => { $(thing).remove() })
    //console.log(css)
    purify(html, css.join(''), {minify: true}, (output) => {
      $('head').append(`<style>\n${output}\n</style>\n`)
      callback($.html())
    })
  }}

}