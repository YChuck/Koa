const delegates = require('delegates')

const proto = module.exports = {

}

delegates(proto, 'response')
    .access('message')
    .access('body')
    .access('length')
    .access('status')
    .getter('headerSent')
    .getter('writable')
    .method('set')
    .method('remove')
    .method('isJSON')

delegates(proto, 'request')
    .method('get')
    .access('method')
    .access('url')
    .getter('header')
    .getter('headers')


    