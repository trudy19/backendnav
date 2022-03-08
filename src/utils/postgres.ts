const pool = require('../pgpool')

export default {
  async select(query: string): Promise<any[]> {
    let client, res
    try {
      client = await pool.connect()
      res = (await client.query(query)).rows
    } catch (e) {
      console.error(e)
    } finally {
      client.release()
    }
    return res ? res: null
  },
  async insert(query: string): Promise<any> {
    let client, res
    try {
      client = await pool.connect()
      res = (await client.query(query)).rows[0]
    } catch (e) {
      console.error(e)
      res = null
    } finally {
      client.release()
    }
    return res
  },
  async update(query: string): Promise<any> {
    let client, res
    try {
      client = await pool.connect()
      res = (await client.query(query)).rows[0]
    } catch (e) {
      console.error(e)
      res = null
    } finally {
      client.release()
    }
    return res
  },
  async delete(query: string): Promise<{success: boolean}> {
    let client, res
    try {
      client = await pool.connect()
      res = await client.query(query)
    } catch (e) {
      console.error(e)
    } finally {
      client.release()
    }
    return {
      success: !!res
    }
  },
}
