import express from 'express'
import search from './routes/search';

var app = express()

app.get('/search', search)

const port = process.env.PORT || process.env.port || 3000

app.listen(port, () => {
    console.log(`listening on ${port}`)
})
