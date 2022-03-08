import express from "express";
const router = express.Router();
import model from '../models/taskInstructions'
import wiModel from '../models/workingInfo'

router.route('/')
  .get((req: express.Request, res: express.Response) => {
    model.getTaskInstructions()
        .then(result => {
          res.json(result)
        })
  })
  .post((req, res) => {
    const taskInstructions = req.body.taskInstructions
    const workerId = req.body.workerId
    model.storeTaskInstructions(taskInstructions, workerId)
        .then(result => {
          res.json(result)
        })
  })

router.route('/assign')
  .get((req: express.Request, res: express.Response) => {
    const groupId = req.query.id as string | undefined
    if (groupId === undefined) {
      res.json([])
      return
    }
    model.getAssignableTasks(parseInt(groupId))
        .then(result => {
          res.json(result)
        })
  })

router.get('/opt', (req: express.Request, res: express.Response) => {
  const workerId = parseInt(req.query.id as string)
  wiModel.optimization(workerId)
      .then(result => {
        res.json(result)
      })
})

router.get('/opt/input', (req: express.Request, res: express.Response) => {
  wiModel.getOptimizationInput(0)
      .then(result => {
        res.json(result)
      })
})

router.get

module.exports = router;
