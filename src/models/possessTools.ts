import pgutil from '../utils/postgres'

export type PossessTools = {
  [key: number]: boolean
}

export default {
  async changeToolPossessFlag(taskId: number, flag: boolean) {
    if (flag) {
      await pgutil.insert(`INSERT INTO possess_tools (task_id) VALUES (${taskId})`)
    } else {
      await pgutil.delete(`DELETE FROM possess_tools WHERE task_id=${taskId}`)
    }
  },
  async getAllToolPossessFlag(): Promise<PossessTools> {
    const rows = await pgutil.select(`SELECT * FROM possess_tools`)
    let possesTools: PossessTools = {}
    for (let r of rows) {
      possesTools[r.task_id] = true
    }
    return possesTools
  },
  async getPossesToolFlag(taskId: number): Promise<boolean> {
    const rows = await pgutil.select(`SELECT * FROM possess_tools WHERE task_id=${taskId}`)
    return rows.length > 0;
  }
}
