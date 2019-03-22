import { Request, Response } from "express";
import { classifications, concepts, items } from "../core/search";
import { Query } from "../types/server";

export default (req: Request, res: Response) => {
  const { labels: rawLabels } = req.query as Query
  const labels: string[] = rawLabels.split(',')
  const classificationResults = classifications.search(labels[0])
  const conceptResults = concepts.search(labels[0])
  const itemResults = items.search(labels[0])
  res.json({
    input: labels,
    classificationResults,
    itemResults,
    conceptResults,
  })
}
