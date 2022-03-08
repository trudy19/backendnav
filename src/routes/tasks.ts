import express from "express";
const router = express.Router();
import model from '../models/tasks'

router.route('/')
  .get((req: express.Request, res: express.Response) => {
    model.getTasks()
        .then(result => {
          res.json(result)
        })
  })
  .post((req: express.Request, res: express.Response) => {
    const task = req.body
    model.addTask(task)
        .then(result => {
          res.json(result)
        })
  })
    .put((req: express.Request, res: express.Response) => {
      const task = req.body
      model.updateTask(task)
          .then(result => {
            res.json(result)
          })
    })
    .delete((req: express.Request, res: express.Response) => {
      const taskId = req.query.taskId as string | undefined
      if (taskId) {
        const taskIdNum = parseInt(taskId)
        model.deleteTask(taskIdNum)
            .then(result => {
              res.json(result)
            })
      }
    })

router.route('/multi')
    .post((req: express.Request, res: express.Response) => {
      const tasks = req.body
      model.addTasks(tasks)
          .then(result => {
            res.json(result)
          })
    })

router.route('/count')
    .get((req: express.Request, res: express.Response) => {
      const taskId = parseInt(req.query.id as string)
      model.getCurrentCount(taskId)
          .then(result => {
            res.json(result)
          })
    })
    .post((req: express.Request, res: express.Response) => {
      const {id, count}= req.body
      model.setCurrentCount(id, count)
          .then(result => {
            res.json(result)
          })
    })


router.route('/count/multi')
    .post((req: express.Request, res: express.Response) => {
      const counts = req.body as { id: number, count: number }[]
      model.setCurrentCountToTasks(counts)
          .then(result => {
            res.json(result)
          })
    })
router.route('/count/increment')
    .get((req: express.Request, res: express.Response) => {
      const taskId = req.query.id as string
      model.incrementCount(parseInt(taskId))
          .then(result => {
            res.json(result)
          })
    })


router.get('/downtimes', (req: express.Request, res: express.Response) => {
  // TODO
  res.json([])
});

router.get('/downtimes/isMachineStopping', (req: express.Request, res: express.Response) => {
  const machineName = req.query.machine_name as string
  console.log(machineName)
  model.getIsMachineStopping(machineName)
      .then(result => {
        res.json(result)
      })
});

module.exports = router;
