import { Request, Response } from 'express'
import { Query } from '../types/server'
import { findDisambiguationValues } from '../modules/findItem'
import data from '../core/data'

export default (req: Request, res: Response) => {
  const { ids: rawIds } = req.query as Query
  const ids: string[] = rawIds.toLowerCase().split(',').map(_ => _.trim())
  const items = data.items.filter(_ => ids.includes(_.id))
  const attributes = findDisambiguationValues(items)
  res.json({
    attributes
  })
}
