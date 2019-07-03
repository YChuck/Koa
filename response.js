const statuses = require('statuses') // This module provides a list of status codes and messages sourced from a few different projects: node nginx apache ...
module.exports = {

    get header() {
        return this.res.getHeaders()
    },

    get headers() {
        return this.header;
    },

    get message() {
        return this.res.statusMessage || statuses[this.status]
    },

    set message(msg) {
        this.res.statusMessage = msg
    },

    get body() {
        return this._body;
    },

    set body(val) {
        const original = this._body
        this._body = val

        // no content
        if (null === val) {
            if (!statuses.empty[this.status]) this.status = 204
            this.remove('Content-Type')
            this.remove('Content-Length')
            this.remove('Transfer-Encoding')
            return
        }

        if (!this._explicitStatus) this.status = 200

        // set the content-type only if not yet set
        const setType = !this.header['content-type']

        if ('string' === typeof val) {
            if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text'
            this.length = Buffer.byteLength(val)
            return
        }

        // buffer
        if (Buffer.isBuffer(val)) {
            if (setType) this.type = 'bin'
            this.length = val.length
            return
        }

        // stream
        if ('function' == typeof val.pipe) {
            // onFinish(this.res, destroy.bind(null, val));
            // ensureErrorHandler(val, err => this.ctx.onerror(err));

            // overwriting
            if (null != original && original != val) this.remove('Content-Length');

            if (setType) this.type = 'bin';
            return;
        }

        // json
        this.remove('Content-Length');
        this.type = 'json';

    },

    set length(n) {
        this.set('Content-Length', n);
    },

    /**
     * Return parsed response Content-Length when present.
     *
     * @return {Number}
     * @api public
     */
    get length() {
        const len = this.header['content-length']
        const body = this.body
        if (null === len) {
            if (!body) return
            if ('string' === typeof body) return Buffer.byteLength(body)
            if (Buffer.isBuffer(body)) return body.length
            if (this.isJSON(body)) return Buffer.byteLength(JSON.stringify(body))
        }
        return Math.trunc(len) || 0
    },

    isJSON(body) {
        if (!body) return false;
        if ('string' == typeof body) return false;
        if ('function' == typeof body.pipe) return false;
        if (Buffer.isBuffer(body)) return false;
        return true;
    },

    /**
     * Boolean (read-only). True if headers were sent, false otherwise
     */
    get headerSent() {
        return this.res.headersSent
    },

    get status() {
        return this.res.statusCode
    },

    /**
     * 在服务器请求的情况下，客户端发送的HTTP版本。在客户端响应的情况下，连接到服务器的HTTP版本。可能是'1.1'或'1.0'
     * message.httpVersionMajor 是第一个整数  message.httpVersionMinor是第二个数 
     */
    set status(code) {
        if (this.headerSent) return
        this._explicitStatus = true
        this.res.statusCode = code
        if (this.req.httpVersionMajor < 2) this.res.statusMessage = statuses[code];
        if (this.body && statuses.empty[code]) this.body = null;
    },

    /**
     * Set header `field` to `val`, or pass
     * an object of header fields.
     *
     * Examples:
     *
     *    this.set('Foo', ['bar', 'baz']);
     *    this.set('Accept', 'application/json');
     *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
     *
     * @param {String|Object|Array} field
     * @param {String} val
     * @api public
     */
    set(field, val) {
        if (this.headerSent) return
        if (2 == arguments.length) {
            if (Array.isArray(val)) val = val.map(v => typeof v === 'string' ? v : String(v))
            else if (typeof val !== 'string') val = String(val)
            this.res.setHeader(field, val)
        } else {
            for (const key in field) {
                this.set(key, field[key]);
            }
        }
    },

    get(field) {
        return this.header[field.toLowerCase()] || '';
    },

    remove(field) {
        if (this.headerSent) return;
        this.res.removeHeader(field);
    },

    /**
   * Checks if the request is writable.
   * Tests for the existence of the socket
   * as node sometimes does not set it.
   *
   * @return {Boolean}
   * @api private
   */

    get writable() {
        // can't write any more after response finished
        if (this.res.finished) return false;

        const socket = this.res.socket;
        // There are already pending outgoing res, but still writable
        // https://github.com/nodejs/node/blob/v4.4.7/lib/_http_server.js#L486
        if (!socket) return true;
        return socket.writable;
    }

}