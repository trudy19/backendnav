import express from 'express'
const router = express.Router();
import model from '../models/carts'

router.route('/')
  .get((req: express.Request, res: express.Response) => {
    model.getCarts().then(result => {
      res.json(result)
    })
  }).post((req: express.Request, res: express.Response) => {
    const {name} = req.body
    model.addCart(name).then(result => {
      res.json(result)
    })
  })
  .put((req: express.Request, res: express.Response) => {
    const {id, name} = req.body
    model.updateCart({id, name}).then(result => {
        res.json(result)
    })
  })
  .delete((req: express.Request, res: express.Response) => {
    const cartId = req.query.id as string | undefined
    if (cartId === undefined) {
      res.json({success: false})
    } else {
      const cartIdNum = parseInt(cartId)
      model.deleteCart(cartIdNum).then(result => {
        res.json(result)
      })
    }
  })

module.exports = router
