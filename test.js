const Koa = require('.')
const app = new Koa()

function delay (overtime) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(overtime)
            resolve()
        }, overtime)
    })
}

// app.use((req, res) => {
//     res.end('hahaha')
// })

// Koa 内部 compose 对每个 middleware 都使用 Promise.resolve 封装成 Promise
// middleware 不使用 awiat 则异步事件无法等待结果
app.use(async (ctx, next) => {
    console.log('first 1')
    await delay(1000)
    ctx.body = [{ name: 'chuck' }]
    await next() // 这里不写 next 则下一个 middleware 的异步操作 无法等待结果
    console.log('first 2')
}).use(async ctx => {
    console.log('second')
    await delay(3000)
    // ctx.body += 'Hello World'
}).listen(3000, () => {
    console.log('listen...')
})