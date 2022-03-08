import express from "express";
const router = express.Router();
import model from '../models/workingInfo'
import tiModel from '../models/taskInstructions'

router.get('/groups/briefStatus', (req: express.Request, res: express.Response) => {
  model.getAllGroupsBriefStatus()
      .then(result => {
        res.json(result)
      })
})

router.get('/workers/workingTaskInstruction', (req: express.Request, res: express.Response) => {
  const workerId = parseInt(req.query.workerId as string)
  model.getWorkingTaskInstruction(workerId)
      .then(ti => {
        if (!ti) {
          res.json([])
        } else {
          // TODO timeの型
          res.json({
            id: ti.id,
            task: ti.task,
            dueTimeStart: ti.dueTimeStart.toISOString(),
            dueTimeEnd: ti.dueTimeEnd.toISOString(),
            startAt: ti.startAt,
            endAt: ti.endAt
          })
        }
      })
});

router.get('/workers/restTaskInstructions', (req: express.Request, res: express.Response) => {
  const workerId = parseInt(req.query.workerId as string)
  model.getWorkingTaskInstructionId(workerId)
      .then(taskInstructionId => {
        if (!taskInstructionId) {
          res.json([])
          return
        } else {
          tiModel.getRestTaskInstructionsComplemented(taskInstructionId)
              .then(taskInstructions => {
                res.json(taskInstructions)
              })
        }
      })
});

router.get('/map/workerInfoList', function(req, res) {
  model.getMapInfoList()
      .then(l => {
        res.json(l)
      })
})

router.get('/map/points', (req: express.Request, res: express.Response) => {
  const workerId = parseInt(req.query.workerId as string)
  model.getMapPoints(workerId)
      .then(points => {
        res.json(points)
      })
})

router.get('/map/paths', function(req, res) {
  const workerId = parseInt(req.query.workerId as string)
  model.getPathPositionLists(workerId)
      .then(lists => {
        res.json(lists)
      })
})


router.get('/workers/allTaskInstructions', function(req: express.Request, res: express.Response) {
  const workerId = parseInt(req.query.workerId as string)
  model.getWorkingTaskInstructionId(workerId)
      .then(tid => {
        if (!tid) {
          res.json([])
        } else {
          tiModel.getAllTaskInstructionsComplemented(tid)
              .then(tis => {
                res.json(tis)
              })
        }
      })
})

router.get('/workers/startTask', function(req, res) {
  const workerId = parseInt(req.query.workerId as string)
  model.startTask(workerId)
      .then(ret => {
        res.json(ret)
      })
});

router.get('/opt/test', (req, res) => {
  const workerId = parseInt(req.query.workerId as string)
  model.testOptimizasion(workerId)
      .then(ret => {
        res.json(ret)
      })
})

router.get('/workers/finishTask', (req: express.Request, res: express.Response) => {
  const workerId = parseInt(req.query.workerId as string)
  model.finishTask(workerId)
      .then(ret => {
        res.json(ret)
      })
});

router.get('/workers/cancelStart', (req: express.Request, res: express.Response) => {
  const workerId = parseInt(req.query.workerId as string)
  model.cancelStart(workerId)
      .then(ret => {
        res.json(ret)
      })
});

router.get('/isWorking', (req: express.Request, res: express.Response) => {
  const workerId = parseInt(req.query.workerId as string)
  model.isWorking(workerId)
      .then(ret => {
        res.json(ret)
      })
})

router.get('/opt/overall', (req: express.Request, res: express.Response) => {
  model.optimizeOverall()
      .then(ret => {
        res.json(ret)
      })
})

router.get('/reliefsTaskList', (req: express.Request, res: express.Response) => {
  const workerId = parseInt(req.query.workerId as string)
  model.getReliefTaskList(workerId)
      .then(ret => {
        res.json(ret)
      })
})


router.post('/assignableTasks', (req: express.Request, res: express.Response) => {
  const {groupId, taskIds} = req.body
  model.setAssignableTasks(groupId, taskIds)
      .then(result => {
        res.json(result)
      })
})


module.exports = router;
