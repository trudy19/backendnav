import pgutil from '../utils/postgres'
import wiModel from './workingInfo'

export type Task = {
  id?: number // データベース id
  line?: string // ライン
  process_no?: string // 工程 No.
  machine_name?: string // 機番
  task_name?: string // 工程名
  task_category?: string // 作業分類
  base?: string // 基点
  numeric_id?: number // Numeric ID
  ip_address?: string // IP Address
  reset_type?: string // ﾘｾｯﾄ方法
  shelf_num?: number // 棚番号
  drill_serial?: number // 刃具連番
  magazine_no?: number // マガジンNo
  tool_no?: string // ツールNo
  installed_count?: number // 取付数
  setting_time?: number // セッチング時間[秒/回]
  tool_cost_piece?: number // 工具費[円/本]
  regrind_cost_piece?: number // 再研費[円/本]
  regrind_count?: number // 再研回数
  tool_cost_machine?: number // 工具費[円/台]
  drill_counter_forecast?: number // 刃具カウンター 予報
  drill_counter_stop?: number // 刃具カウンター 停止
  worktime_manual?: number // 作業時間[秒] 手作業
  worktime_walk?: number // 作業時間[秒] 歩行
  worktime_div_unit?: number // 作業分割単位[秒]
  cart_handling_time?: number // 台車取り回し時間[秒]
  cart_type?: string // 台車種類
  cart_occupancy?: number // 台車占有率[％]
  cart_base?: string // 台車基点
  targeted_setting_task_category?: string // "(1H)セッチングA",
  address_count?: string //
  address_reset: string //
  cycle_time?: string //
  current_count?: number // 現在のカウント
  stock?: boolean // deprecated ツールを持っているか
  periodic_work: number // 定期作業回数/直
  task_type: string // "定量作業"
  task_time_ratio: number // cycle_timeの倍率
}

const depotTasks = (require('../../mocks/depot-tasks.json')).tasks

export default {
  async getTask(taskId: number): Promise<Task | null> {
    console.log('getTask id=', taskId)
    if (taskId >= 997) {
      // depot処理
      const task = depotTasks.find((i: any) => i.id === taskId)
      console.log('depot', task)
      return task
    }
    const result = await pgutil.select(`SELECT * FROM datasheet WHERE id=${taskId}`)
    if (result.length > 0) return result[0]
    else return null
  },
  async getTasks(): Promise<Task[] | null> {
    return pgutil.select(`SELECT *
                                  FROM datasheet
                                  ORDER BY id`)
  },
  async getUrgentTasks(): Promise<Task[] | null> {
    return pgutil.select(`SELECT *
                                  FROM urgent_tasks
                                  WHERE working_flag=TRUE
                                  ORDER BY id`)
  },
  async addTask(task: Task): Promise<Task | null> {
    console.log('called',  (`'${task.id}','${task.line}',
            '${task.process_no}',
            '${task.machine_name}',
            '${task.task_name}',
            '${task.task_category}',
            '${task.base}',
            '${task.numeric_id}',
            '${task.ip_address}',
            '${task.reset_type}',
            '${task.shelf_num}',
            '${task.drill_serial}',
            '${task.magazine_no}',
            '${task.tool_no}',
            '${task.installed_count}',
            '${task.setting_time}',
            '${task.tool_cost_piece}',
            '${task.regrind_cost_piece}',
            '${task.regrind_count}',
            '${task.tool_cost_machine}',
            '${task.drill_counter_forecast}',
            '${task.drill_counter_stop}',
            '${task.worktime_manual}',
            '${task.worktime_walk}',
            '${task.worktime_div_unit}',
            '${task.cart_handling_time}',
            '${task.cart_type}',
            '${task.cart_occupancy}',
            '${task.cart_base}',
            '${task.targeted_setting_task_category}',
            '${task.address_count}',
            '${task.address_reset}',
            '${task.cycle_time}',
            '${task.current_count}',
            '${task.stock}',
            '${task.periodic_work}',
            '${task.task_type}',
            '${task.task_time_ratio}'`
    ))
    const res = await pgutil.insert(
        `INSERT INTO datasheet
        (id, line,
        process_no,
        machine_name,
        task_name,
        task_category,
        base,
        numeric_id,
        ip_address,
        reset_type,
        shelf_num,
        drill_serial,
        magazine_no,
        tool_no,
        installed_count,
        setting_time,
        tool_cost_piece,
        regrind_cost_piece,
        regrind_count,
        tool_cost_machine,
        drill_counter_forecast,
        drill_counter_stop,
        worktime_manual,
        worktime_walk,
        worktime_div_unit,
        cart_handling_time,
        cart_type,
        cart_occupancy,
        cart_base,
        targeted_setting_task_category,
        address_count,
        address_reset,
        cycle_time,
        current_count,
        stock,
        periodic_work,
        task_type,
        task_time_ratio)
        VALUES
        ('${task.id}', '${task.line}',
        '${task.process_no}',
         '${task.machine_name}',
         '${task.task_name}',
         '${task.task_category}',
         '${task.base}',
         '${task.numeric_id}',
         '${task.ip_address}',
         '${task.reset_type}',
         '${task.shelf_num}',
         '${task.drill_serial}',
         '${task.magazine_no}',
         '${task.tool_no}',
         '${task.installed_count}',
         '${task.setting_time}',
         '${task.tool_cost_piece}',
         '${task.regrind_cost_piece}',
         '${task.regrind_count}',
         '${task.tool_cost_machine}',
         '${task.drill_counter_forecast}',
         '${task.drill_counter_stop}',
         '${task.worktime_manual}',
         '${task.worktime_walk}',
         '${task.worktime_div_unit}',
         '${task.cart_handling_time}',
         '${task.cart_type}',
         '${task.cart_occupancy}',
         '${task.cart_base}',
         '${task.targeted_setting_task_category}',
         '${task.address_count}',
         '${task.address_reset}',
         '${task.cycle_time}',
         '${task.current_count}',
         '${task.stock}',
         '${task.periodic_work}',
         '${task.task_type}',
         '${task.task_time_ratio}'
         )
        RETURNING *`
    )
    console.log(res)
    return res ? {
      id: res.id as number,
      ...task
    } : null
  },
  async addTasks(tasks: Task[]): Promise<{success: boolean}> {
    console.log(tasks.length)
    for (let i = 0; i < tasks.length; i++) {
      await this.addTask(tasks[i])
    }
    console.log("end")
    return {success: true}
  },
  async updateTask(task: Task): Promise<Task | null> {
    const res = await pgutil.update(
        `UPDATE datasheet SET
        line='${task.line}',
        process_no='${task.process_no}',
        machine_name='${task.machine_name}',
        task_name='${task.task_name}',
        task_category='${task.task_category}',
        base='${task.base}',
        numeric_id='${task.numeric_id}',
        ip_address='${task.ip_address}',
        reset_type='${task.reset_type}',
        shelf_num='${task.shelf_num}',
        drill_serial='${task.drill_serial}',
        magazine_no='${task.magazine_no}',
        tool_no='${task.tool_no}',
        installed_count='${task.installed_count}',
        setting_time='${task.setting_time}',
        tool_cost_piece='${task.tool_cost_piece}',
        regrind_cost_piece='${task.regrind_cost_piece}',
        regrind_count='${task.regrind_count}',
        tool_cost_machine='${task.tool_cost_machine}',
        drill_counter_forecast='${task.drill_counter_forecast}',
        drill_counter_stop='${task.drill_counter_stop}',
        worktime_manual='${task.worktime_manual}',
        worktime_walk='${task.worktime_walk}',
        worktime_div_unit='${task.worktime_div_unit}',
        cart_handling_time='${task.cart_handling_time}',
        cart_type='${task.cart_type}',
        cart_occupancy='${task.cart_occupancy}',
        cart_base='${task.cart_base}',
        targeted_setting_task_category='${task.targeted_setting_task_category}',
        address_count='${task.address_count}',
        address_reset='${task.address_reset}',
        cycle_time='${task.cycle_time}',
        current_count='${task.current_count}',
        stock='${task.stock}',
        periodic_work='${task.periodic_work}',
        task_type='${task.task_type}',
        task_time_ratio='${task.task_time_ratio}'
        WHERE id=${task.id}`)
    return res ? {
      id: res.id as number,
      ...task
    } : null
  },
  async deleteTask(taskId: number): Promise<{success: boolean}> {
    return await pgutil.delete( `DELETE FROM datasheet WHERE id=${taskId}`)
  },
  async getCurrentCount(taskId: number): Promise<number> {
    const counts = (await pgutil.select(`SELECT current_count FROM datasheet WHERE id=${taskId}`)).map(i => i.current_count)
    if (counts.length > 0) return counts[0]
    return -1
  },
  async setCurrentCount(taskId: number, count: number): Promise<Task> {
    return await pgutil.update(`UPDATE datasheet SET current_count=${count} WHERE id=${taskId}`)
  },
  async setCurrentCountToTasks(counts: {id: number, count: number}[]): Promise<{ success: boolean }> {
    for (const count of counts) {
      await this.setCurrentCount(count.id, count.count)
    }
    return {success: true}
  },
  async incrementCount(taskId: number): Promise<{ success: boolean }> {
    const task = await this.getTask(taskId)
    if (task && task.current_count != undefined) {
      await pgutil.update(`UPDATE datasheet SET current_count=${1 + task.current_count} WHERE id=${taskId}`)
      return {success: true}
    } else {
      return {success: false}
    }
  },
  async getIsMachineStopping(machineName: string): Promise<boolean> {
    const ti = await wiModel.getWorkingTaskInstruction(0)
    if (!ti || !ti.task.id || !ti.startAt) {
      return false
    } else {
      const stopTasks = [
        {name: '1号機', ids: [6, 9, 12, 18]},
        {name: '2号機', ids: [7, 10, 13, 19]},
        {name: '3号機', ids: [8, 11, 14, 20]}
      ]
      const t = stopTasks.find(i => i.name === machineName && ti.task.id != undefined && i.ids.includes(ti.task.id))
      return !!t
    }
  }
}
