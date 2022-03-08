import pgutil from '../utils/postgres'
import {TaskInstructionComplemented} from "./taskInstructions";
import {Worker} from "./workers";

export type WorkingLog = {
  id: number
  task_id: number
  worker_id: number
  actual_start_time: string
  actual_working_time: string
  exchange_time: string
  expected_finish_time: string
  working_time: string
  actual_end_time: string
  actual_latency_time: string
  expected_moving_distance: string
  expected_latency_time: string
  expected_drill_life_loss: string
  worker_name: string
  actual_remaining_count: string
}

export default {
  async addWorkingLogs(taskInstruction: TaskInstructionComplemented, worker: Worker): Promise<{success: boolean}> {
    const taskId = taskInstruction.task.id
    const workerId = worker.id
    if (!taskInstruction.startAt || !taskInstruction.endAt) {
      return {success: false}
    }
    const actualStartTime = (new Date(taskInstruction.startAt)).getTime() / 1000
    const actualEndTime = (new Date(taskInstruction.endAt)).getTime() / 1000

    const actualWorkingTime = actualEndTime - actualStartTime
    const exchangeTime = (new Date(taskInstruction.dueTimeStart)).getTime() / 1000
    const expectedFinishTime = (new Date(taskInstruction.dueTimeEnd)).getTime() / 1000
    const workingTime = taskInstruction.working_time
    const actualLatencyTime = null
    // const expectedMovingTime = taskInstruction.expected_moving_time
    const expectedMovingDistance = taskInstruction.expected_moving_distance
    const expectedLatencyTime = taskInstruction.expected_latency_time
    const expectedDrillLifeLoss = taskInstruction.expected_drill_life_loss
    const workerName = worker.name
    const actualRemainingCount = taskInstruction.task.current_count
    const res = await pgutil.insert(`INSERT INTO working_logs
(task_id, worker_id, actual_start_time, actual_working_time,
 exchange_time, expected_finish_time, working_time, actual_end_time,
 actual_latency_time, expected_moving_distance, expected_latency_time,
 expected_drill_life_loss, worker_name, actual_remaining_count)
 VALUES (
            '${taskId}',
            '${workerId}',
            '${actualStartTime}',
            '${actualWorkingTime}',
            '${exchangeTime}',
            '${expectedFinishTime}',
            '${workingTime}',
            '${actualEndTime}',
            '${actualLatencyTime}',
            '${expectedMovingDistance}',
            '${expectedLatencyTime}',
            '${expectedDrillLifeLoss}',
            '${workerName}',
            '${actualRemainingCount}'
        )
    `)
    return {success: true}
  },
  async popLatestWorkingLog(workerId: number): Promise<WorkingLog | undefined> {
    const logs = await pgutil.select(
        `SELECT * FROM working_logs WHERE worker_id=${workerId}
        ORDER BY created DESC
        `)
    if (logs.length === 0) {
      return undefined
    } else {
      await pgutil.delete(`DELETE FROM working_logs WHERE id=${logs[0].id}`)
      return logs[0]
    }
  }
}
