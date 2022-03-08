import pgutil from '../utils/postgres'
import tasksModel, {Task} from "./tasks";
import stockModel from './possessTools'

export type TaskInstructionComplemented = {
  id: number
  task: Task
  dueTimeStart: Date
  dueTimeEnd: Date
  startAt?: string
  endAt?: string
  working_time?: number
  expected_drill_life_loss?: number
  expected_latency_time?: number
  expected_moving_distance?: number
  expected_moving_time?: number
  enable_optimization?: boolean
}

export type TaskInstruction = {
  id: number
  task_id: number
  dueTimeStart: string
  dueTimeEnd: string
  startAt?: string
  endAt?: string
  next_id: number | null
  previous_id: number | null
  working_time?: number
  expected_drill_life_loss?: number
  expected_latency_time?: number
  expected_moving_distance?: number
  expected_moving_time?: number
  enable_optimization?: boolean
}

export type AssignableTask = {
  id: number
  group_id: number
  task_id: number
}

export default {
  async storeTaskInstruction(taskInstruction: TaskInstruction, workerId: number, previousId: number | null = null, nextId: number | null = null): Promise<TaskInstruction> {
    const {
      task_id, dueTimeStart, dueTimeEnd,
      expected_drill_life_loss,
      expected_latency_time,
      expected_moving_distance,
      expected_moving_time,
      enable_optimization
    } = taskInstruction
    return await pgutil.insert(`INSERT INTO task_instructions 
    (worker_id, task_id, due_start, due_end, previous_id, next_id,
      expected_drill_life_loss,
      expected_latency_time,
      expected_moving_distance,
      expected_moving_time,
      enable_optimization
    )
              VALUES 
              (${workerId}, ${task_id}, '${dueTimeStart}', '${dueTimeEnd}', ${previousId}, ${nextId},
              ${expected_drill_life_loss},
              ${expected_latency_time},
              ${expected_moving_distance},
              ${expected_moving_time},
              ${enable_optimization}
              )
              RETURNING *`)
  },
  async getTaskInstructions(): Promise<{id: number, task_id: number, due_start: string, due_end: string}[]> {
    return await pgutil.select(`SELECT * FROM task_instructions`)
  },
  async getTaskInstruction(taskInstructionId: number): Promise<TaskInstruction | null> {
    const taskInstructions = (await pgutil.select(`SELECT * FROM task_instructions WHERE id=${taskInstructionId}`))
    if (taskInstructions.length > 0) {
      const i = taskInstructions[0]
      return {
        ...i,
        dueTimeEnd: i.due_end,
        dueTimeStart: i.due_start,
        startAt: i.start_at,
        endAt: i.endAt
      } as TaskInstruction
    } else {
      return null
    }
  },
  async getRestTaskInstructionsComplemented(currentId: number): Promise<TaskInstructionComplemented[]> {
    let cur = await this.getTaskInstruction(currentId)
    let res: TaskInstructionComplemented[] = []
    for (;;) {
      if (!cur || !cur.next_id) break
      cur = await this.getTaskInstruction(cur.next_id)
      if (!cur) break
      const task = await tasksModel.getTask(cur.task_id)
      if (!task) break
      res.push({
        id: cur.id,
        task: task,
        dueTimeStart: new Date(cur.dueTimeStart),
        dueTimeEnd: new Date(cur.dueTimeEnd)
      })
    }
    return res
  },
  async getAllTaskInstructionsComplemented(currentId: number): Promise<any> {
    let cur = { next_id: currentId } as any
    let res = []
    console.log('ati 1')
    for (;;) {
      if (!cur.next_id) break
      cur = (await this.getTaskInstruction(cur.next_id))
      if (!cur) break
      console.log('ati 2')
      res.push({
        id: cur.id,
        task: await tasksModel.getTask(cur.task_id),
        dueTimeStart: new Date(cur.dueTimeStart),
        dueTimeEnd: new Date(cur.dueTimeEnd),
        next_id: cur.next_id,
        prev_id: cur.previous_id,
        enable_optimization: cur.enable_optimization
      })
    }
    return res
  },
  async getTaskInstructionComplemented(taskInstructionId: number): Promise<TaskInstructionComplemented | undefined> {
    const taskInstruction = await this.getTaskInstruction(taskInstructionId)
    if (taskInstruction == null) return undefined
    const task = await tasksModel.getTask(taskInstruction.task_id)
    if (task == null) return undefined
    return {
      id: taskInstruction.id,
      task: task,
      dueTimeStart: new Date(taskInstruction.dueTimeStart),
      dueTimeEnd: new Date(taskInstruction.dueTimeEnd),
      startAt: taskInstruction.startAt,
      endAt: taskInstruction.endAt,
      working_time: taskInstruction.working_time,
      expected_drill_life_loss: taskInstruction.expected_drill_life_loss,
      expected_latency_time: taskInstruction.expected_latency_time,
      expected_moving_distance: taskInstruction.expected_moving_distance,
      expected_moving_time: taskInstruction.expected_moving_time,
      enable_optimization: taskInstruction.enable_optimization
    }
  },
  async setWorkingInfo(workerId: number, taskInstructionId: number): Promise<void> {
    await pgutil.delete(`DELETE FROM working_info WHERE worker_id=${workerId}`)
    await pgutil.insert(`INSERT INTO working_info (worker_id, task_instruction_id) VALUES (${workerId}, ${taskInstructionId})`)
  },
  async setNextId(taskInstructionId: number, nextId: number | null, ): Promise<void> {
    await pgutil.update(`UPDATE task_instructions SET next_id=${nextId} WHERE id=${taskInstructionId}`)
  },
  async clearInstructions(workerId: number): Promise<void> {
    await pgutil.delete(`DELETE FROM task_instructions WHERE worker_id=${workerId}`)
  },
  async storeTaskInstructions(taskInstructions: TaskInstruction[], workerId: number): Promise<number> {
    // return: originId
    let prev = {
      id: null as number | null
    }
    // TODO raise error if origin === undefined
    let originId = -1
    for (let i = 0; i < taskInstructions.length; i++) {
      const result = await this.storeTaskInstruction(taskInstructions[i], workerId, prev.id)
      if (prev.id != null) {
        await this.setNextId(prev.id, result.id)
      }
      prev = result
      if (i === 0) {
        originId = result.id
      }
    }
    return originId
  },
  async getAssignableTasks(groupId: number): Promise<Task[]> {
    const assignableTasks = await pgutil.select(`SELECT task_id FROM assignable_tasks WHERE group_id=${groupId}`)
    const assignableTaskIds = assignableTasks.map(i => (i.task_id)).join()
    const tasks = await pgutil.select(`SELECT * FROM datasheet WHERE id IN (${assignableTaskIds})`)
    for (let i = 0; i < tasks.length; i++) {
      tasks[i].stock = await stockModel.getPossesToolFlag(tasks[i].id)
      console.log('flag', tasks[i].id, tasks[i].stock)
    }
    return tasks ? tasks : []
  },
  async getWorkersGroupId(workerId: number): Promise<number> {
    return (await pgutil.select(`SELECT group_id FROM workers WHERE id=${workerId}`))[0].group_id
  }
}
