import express from 'express'
const router = express.Router();
import model from '../models/settings'

router.route('/overtime')
    .get((req: express.Request, res: express.Response) => {
      model.getOvertime().then(result => {
        res.json(result)
      })
    })
    .post((req: express.Request, res: express.Response) => {
      const {overtime} = req.body
      model.setOvertime(overtime).then(result => {
        res.json(result)
      })
    })

router.route('/walkingTime')
    .get((req: express.Request, res: express.Response) => {
      model.getWalkingTime().then(result => {
        res.json(result)
      })
    })
    .post((req: express.Request, res: express.Response) => {
      const {walkingTime} = req.body
      model.setWalkingTime(walkingTime).then(result => {
        res.json(result)
      })
    })

router.route('/walkingCost')
    .get((req: express.Request, res: express.Response) => {
      model.getWalkingCost().then(result => {
        res.json(result)
      })
    })
    .post((req: express.Request, res: express.Response) => {
      const {walkingCost} = req.body
      model.setWalkingCost(walkingCost).then(result => {
        res.json(result)
      })
    })

router.route('/terms')
    .get((req: express.Request, res: express.Response) => {
      model.getTerms().then(result => {
        res.json(result)
      })
    })
    .post((req: express.Request, res: express.Response) => {
      const terms = req.body
      model.setTerms(terms).then(result => {
        res.json(result)
      })
    })

router.route('/restTimes')
    .get((req: express.Request, res: express.Response) => {
      model.getRestTimes().then(result => {
        res.json(result)
      })
    })
    .post((req: express.Request, res: express.Response) => {
      const restTimes = req.body
      model.setRestTimes(restTimes).then(result => {
        res.json(result)
      })
    })

router.route('/initBase')
    .get((req: express.Request, res: express.Response) => {
      model.getInitBase().then(result => {
        res.json(result)
      })
    })
    .post((req: express.Request, res: express.Response) => {
      const {initBase} = req.body
      model.setInitBase(initBase).then(result => {
        res.json(result)
      })
    })

module.exports = router;
