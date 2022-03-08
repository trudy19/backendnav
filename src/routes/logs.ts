import express from 'express'
const router = express.Router();
import model from '../models/logs'

router.route('/errorLogs').get((req: express.Request, res: express.Response) => {
  model.getErrorLogs().then(result => {
    res.json(result)
  })
})
    .post(((req: express.Request, res: express.Response) => {
      const {serviceName, message} = req.body
      model.addErrorLog(serviceName, message)
          .then(result => {
            res.json(result)
          })
    }))
    .delete((req: express.Request, res: express.Response) => {
      model.clearErrorLogs()
          .then(result => {
            res.json(result)
          })
    })

module.exports = router
