import express from 'express'
import search, { findItemsWithClassification } from './routes/search'

let app = express()

app.get('/search', search)

const port = process.env.PORT || process.env.port || 3000

// findItemsWithClassification('egg-roll', [{ conceptId: 'protein', key: 'Pork' }, { conceptId: 'carb-protein', key: 'Pork' } ])

app.listen(port, () => {
  console.log(`listening on ${port}`)
})
