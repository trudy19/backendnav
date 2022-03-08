import express from "express";
const router = express.Router();
import tools from '../models/possessTools'
import categories from '../models/assignedCategories'

router.get('/', (req: express.Request, res: express.Response) => {
  res.json({msg: 'Hello'})
})

router.get('/tools', (req: express.Request, res: express.Response) => {
  const task_id = req.query.task_id as string | undefined
  if (task_id === undefined) {
    res.json({success: false})
    return
  }
  const taskIdNum = parseInt(task_id)
  const flag = req.query.flag === 'true'
  tools.changeToolPossessFlag(taskIdNum, flag)
      .then(() => {
        res.json({success: true})
      })
});

// { [taskId: flag] }
router.get('/tools/all', (req: express.Request, res: express.Response) => {
  tools.getAllToolPossessFlag().then(result => {
    res.json(result)
  })
})


// [ { category_name: str, group_id: int } ]
router.get('/category/assigned', (req: express.Request, res: express.Response) => {
  categories.getAllAssignedCategories().then(result => {
    res.json(result)
  })
})

router.post('/category/assigned', (req: express.Request, res: express.Response) => {
  const categoriesAssigned = req.body
  categories.setAssignedCategories(categoriesAssigned)
      .then(result => {
        res.json(result)
      })
})

router.get('/category/all', (req: express.Request, res: express.Response) => {
  categories.getAllCategories()
      .then(result => {
        res.json(result)
      })
})

module.exports = router;
