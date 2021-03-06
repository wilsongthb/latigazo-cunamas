var path = require('path')
var fs = require('fs')

module.exports = {
    template: fs.readFileSync(path.join(__dirname, 'index.html'), { encoding: 'utf-8'}),
    props: {
        id: {
            require: true
        },
        ficha: {
            require: true,
            type: Object
        }
    }
}