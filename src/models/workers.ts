import pgutil from '../utils/postgres'

export type Worker = {
  id: number
  name: string
  group_id: number
  is_relief: boolean
}

export default {
  async getWorkers(groupId: number, isRelief: boolean): Promise<Worker[] | null> {
    return pgutil.select(`SELECT *
                                  FROM workers
                                  WHERE group_id=${groupId}
                                  AND is_relief=${isRelief}`)
  },
  async getWorker(workerId: number): Promise<{id: number, name: string, groupId: number, isRelief: boolean}> {
    const worker = (await pgutil.select(`SELECT * FROM workers WHERE id=${workerId}`))[0]
    return {
      id: workerId,
      name: worker.name,
      groupId: worker.group_id,
      isRelief: worker.is_relief
    }
  },
  async addWorker(name: string, groupId: number, isRelief: boolean): Promise<Worker | null> {
    const res = await pgutil.insert(`INSERT INTO workers (name, group_id, is_relief) VALUES ('${name}', ${groupId}, ${isRelief})`)
    return res ? {
      id: res.id as number,
      name: name,
      group_id: groupId,
      is_relief: isRelief
    } : null
  },
  async updateWorker(worker: Worker): Promise<Worker | null> {
    const res = await pgutil.update( `UPDATE workers SET name='${worker.name}', is_relief=${worker.is_relief} WHERE id=${worker.id}`,)
    return res ? worker : null
  },
  async deleteWorker(workerId: number): Promise<{success: boolean}> {
    return await pgutil.delete( `DELETE FROM workers WHERE id=${workerId}`)
  }
}
