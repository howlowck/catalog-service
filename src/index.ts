import express from 'express'
import search from './routes/search'
import disambiguate from './routes/disambiguate'
import transform from './routes/transform'

let app = express()

app.get('/search', search)
app.get('/disambiguate', disambiguate)
app.get('/transform', transform)

const port = process.env.PORT || process.env.port || 3000

app.listen(port, () => {
  console.log(`listening on ${port}`)
})
