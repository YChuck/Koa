const http = require('http')
const Stream = require('stream')
const statuses = require('statuses')
const context = require('./context')
const request = require('./request')
const response = require('./response')
const compose = require('./compose')

class Application {

    constructor() {
        this.middleware = []
        this.context = Object.create(context)
        this.request = Object.create(request)
        this.response = Object.create(response)
    }

    use(middleware) {
        if ('function' !== typeof middleware) throw new Error('The Koa middlewear must be an object')
        this.middleware.push(middleware)
        return this
    }

    listen(...args) {
        http.createServer(this.callBack()).listen(...args)
    }

    createContext(req, res) {
        const context = Object.create(this.context)
        const request = context.request = Object.create(this.request)
        const response = context.response = Object.create(this.response)
        context.req = request.req = response.req = req
        context.res = request.res = response.res = res
        request.ctx = response.ctx = context
        request.response = response
        response.request = request
        return context
    }

    callBack() {
        const supFn = compose(this.middleware)
        return (req, res) => {
            const ctx = this.createContext(req, res)
            return supFn(ctx).then(() => { this.respond(ctx) }).catch(this.error)
        }
    }

    error (err) {
        console.log(err)
    }

    respond(ctx) {
        if (!ctx.writable) return

        const res = ctx.res
        let body = ctx.body
        const code = ctx.status

        if (statuses.empty[code]) {
            body = null
            return res.end()
        }

        if ('HEAD' === ctx.method) {
            if (!res.headersSent && ctx.isJSON(body)) {
                ctx.length = Buffer.byteLength(JSON.stringify(body));
            }
            return res.end()
        }

        if (null === body) {
            if (ctx.req.httpVersionMajor >= 2) {
                body = String(code);
            } else {
                body = ctx.message || String(code);
            }
            if (!res.headersSent) {
                ctx.type = 'text';
                ctx.length = Buffer.byteLength(body);
            }
            return res.end(body);
        }

        // responses
        if (Buffer.isBuffer(body)) return res.end(body);
        if ('string' == typeof body) return res.end(body);
        if (body instanceof Stream) return body.pipe(res);

        // body: json
        body = JSON.stringify(body);
        if (!res.headersSent) {
            ctx.length = Buffer.byteLength(body);
        }
        res.end(body);

    }

}

module.exports = Application