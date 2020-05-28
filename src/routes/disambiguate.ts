import { Request, Response } from 'express'
import { Query } from '../types/server'
import { findDisambiguationValues } from '../modules/findItem'
import store from '../core/data'

export default (req: Request, res: Response) => {
  const { ids: rawIds, realm = 'coffee-shop' } = req.query as Query
  const ids: string[] = rawIds.toLowerCase().split(',').map(_ => _.trim())
  const items = store[realm].data.items.filter(_ => ids.includes(_.id))
  const attributes = findDisambiguationValues(items)
  res.json({
    attributes
  })
}
