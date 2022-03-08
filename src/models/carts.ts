import pgutil from '../utils/postgres'

export type Cart = {
  id: number
  name: string
}

export default {
  async getCarts(): Promise<Cart[] | null> {
    return pgutil.select(`SELECT *
                                  FROM carts
                                  ORDER BY id`)
  },
  async addCart(name: string): Promise<Cart | null> {
    const res = await pgutil.insert(`INSERT INTO carts (name) VALUES ('${name}') RETURNING *`)
    return res ? {
      id: res.id as number,
      name: name
    } : null
  },
  async updateCart(cart: Cart): Promise<Cart | null> {
    const res = await pgutil.update(`UPDATE carts SET name='${cart.name}' WHERE id=${cart.id}`)
    return res ? {
      id: res.id as number,
      name: res.name
    } : null
  },
  async deleteCart(cartId: number): Promise<{success: boolean}> {
    return await pgutil.delete( `DELETE FROM carts WHERE id=${cartId}`)
  }
}
