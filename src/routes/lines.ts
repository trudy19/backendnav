import express from 'express'
const router = express.Router();
import model from '../models/lines'

router.route('/')
  .get((req: express.Request, res: express.Response) => {
    model.getLines()
        .then(result => {
          res.json(result)
        })
  }).post((req, res) => {
    const {name, taktTime} = req.body
    model.addLine(name, taktTime).then(result => {
      res.json(result)
    })
  })
  .put((req, res) => {
    const {id, name, taktTime} = req.body
    model.updateLine({id, name, taktTime}).then(result => {
      res.json(result)
    })
  })
  .delete((req, res) => {
    const lineId = req.query.id as string | undefined
    if (lineId === undefined) {
      res.json({success: false})
    } else {
      const lineIdNum = parseInt(lineId)
      model.deleteLine(lineIdNum).then(result => {
        res.json(result)
      })
    }
  })


module.exports = router;
