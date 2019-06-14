module.exports = function compose (middleware) {
    if (!Array.isArray(middleware)) throw new Error('Middleware stack must be an array!')
    for (let fn of middleware) {
        if ('function' !== typeof fn)
            throw new Error('Middleware must be composed of functions!')
    }
    return ctx => {

        function dispatch (index) {
            if (index === middleware.length) return Promise.resolve()
            let fn = middleware[index]
            try {
                return Promise.resolve(fn(ctx, dispatch.bind(null, index + 1)))
            } catch (err) {
                return Promise.reject(err)
            }
        }
        
        return dispatch(0)
    }
}