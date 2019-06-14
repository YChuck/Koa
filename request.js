module.exports = {

    // Key-value pairs of header names and values. Header names are lower-cased
    get header () {
        return this.req.headers
    },

    set header (val) {
        this.req.headers = val
    },

    get headers () {
        return this.req.headers
    },

    set headers (val) {
        this.req.headers = val
    },

    get method () {
        return this.req.method
    },

    set method (val) {
        this.req.method = val
    },

    get length () {
        let len = this.get('Content-Length')
        if (len == '') return;
        return ~~len
    },

    get url () {
        return this.req.url
    },

    set url (val) {
        this.req.url = val
    },

    /**
     * Return request header.
     *
     * The `Referrer` header field is special-cased,
     * both `Referrer` and `Referer` are interchangeable(通用). (`Referer` 书写错误 (http协议))
     * 
     * @param {*} filed 
     */
    get (filed) {
        const req = this.req
        switch (filed = filed.toLowerCase()) {
            case 'referer':
            case 'referrer':
                return req.headers.referrer || req.headers.referer || ''
            default:
                return req.headers[filed] || ''
        }
    }

}