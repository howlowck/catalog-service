import express from 'express'
import search from './routes/search'
import disambiguate from './routes/disambiguate'
import transform from './routes/transform'
import health from './routes/health'

let app = express()

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/search', search)
app.get('/disambiguate', disambiguate)
app.get('/transform', transform)
app.get('/health', health)

const port = process.env.PORT || process.env.port || 3000

app.listen(port, () => {
  console.log(`listening on ${port}`)
})
