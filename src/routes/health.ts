import { Request, Response } from 'express'
import store from '../core/data'

export default (req: Request, res: Response) => {
  const realms = Object.keys(store)
  res.json({
    status: 'healthy',
    realms
  })
}
