import express from "express";
const router = express.Router();
import model from '../models/workerGroups'

router.get('/', (req: express.Request, res: express.Response) => {
  model.getWorkerGroupsComplemented().then(result => {
    res.json(result)
  })
});

module.exports = router;
