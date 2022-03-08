import express from "express";
const router = express.Router();
import model from '../models/workers'

router.route('/')
  .post((req: express.Request, res: express.Response) => {
    const {name, groupId, isRelief} = req.body
    model.addWorker(name, groupId, isRelief)
        .then(result => {
          res.json(result)
        })
  })
  .put((req: express.Request, res: express.Response) => {
    const {worker, isRelief} = req.body.worker
    model.updateWorker({
      ...worker,
      is_relief: isRelief
    }).then(result => {
      res.json(result)
    })
  })
  .delete((req: express.Request, res: express.Response) => {
    const workerId = req.query.id as string | undefined
    if (workerId === undefined) {
      res.json({success: false})
    } else {
      const workerIdNum = parseInt(workerId)
      model.deleteWorker(workerIdNum).then(result => {
        res.json(result)
      })
    }
  })


module.exports = router;
