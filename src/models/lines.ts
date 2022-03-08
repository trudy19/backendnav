import pgutil from '../utils/postgres'

export type Line= {
  id: number
  name: string
  taktTime: number
}

export default {
  async getLines(): Promise<Line[] | null> {
    return pgutil.select(`SELECT *
                                  FROM lines
                                  ORDER BY id`)
  },
  async addLine(name: string, taktTime: number): Promise<Line | null> {
    const res = await pgutil.insert(`INSERT INTO lines (name) VALUES ('${name}') RETURNING *`)
    return res ? {
      id: res.id as number,
      name: name,
      taktTime: res.takt_time
    } : null
  },
  async updateLine(line: Line): Promise<Line | null> {
    const res = await pgutil.update(`UPDATE lines SET name='${line.name}' WHERE id=${line.id}`)
    return res ? {
      id: res.id as number,
      name: res.name,
      taktTime: res.takt_time
    } : null
  },
  async deleteLine(lineId: number): Promise<{success: boolean}> {
    return await pgutil.delete( `DELETE FROM lines WHERE id=${lineId}`)
  }
}
