import pgutil from '../utils/postgres'
import tiModel, {TaskInstructionComplemented} from '../models/taskInstructions'
import workerModel from '../models/workers'
import ptModel from './possessTools'
import logModel from './workingLogs'
const {getPositionFromId, getPathPositions, name2id} = require('../../mocks/routeProvider')
import request from '../utils/zmq'
import taskModel, {Task} from "./tasks";
import {overall} from '../utils/overall'
import settingModel from './settings'
const fs = require('fs')

const data = require('../../mocks/req_data.json')

function toISOStringWithTimezone(date: Date): string {
  const pad = function (str: string): string {
    return ('0' + str).slice(-2);
  }
  const year = (date.getFullYear()).toString();
  const month = pad((date.getMonth() + 1).toString());
  const day = pad(date.getDate().toString());
  const hour = pad(date.getHours().toString());
  const min = pad(date.getMinutes().toString());
  const sec = pad(date.getSeconds().toString());
  const tz = -date.getTimezoneOffset();
  const sign = tz >= 0 ? '+' : '-';
  const tzHour = pad((tz / 60).toString());
  const tzMin = pad((tz % 60).toString());
    return `${year}-${month}-${day}T${hour}:${min}:${sec}${sign}${tzHour}:${tzMin}`;
}

export type WorkerMapInfo = {
  worker:{
    id: number,
    name: string
  }
  currentTaskInfo: {
    task: Task,
    position: {
      x: number,
      y: number
    }
  }
  nextTaskInfo?: {
    task: Task,
    position: {
      x: number,
      y: number
    }
  }
  isMoving: boolean
  pathPositions?: { x: number, y: number }[]
}

export default {
  async getBasePosition(baseName: string): Promise<{x: number, y: number}> {
    return (await pgutil.select(`SELECT * FROM bases WHERE name='${baseName}'`))[0]
  },
  async resetCount(taskId: number) {
    return await pgutil.update(`UPDATE datasheet SET current_count=0 WHERE id=${taskId}`)
  },
  async setCount(taskId: number, count: number) {
    return await pgutil.update(`UPDATE datasheet SET current_count=${count} WHERE id=${taskId}`)
  },
  async setWorkingInfo(workerId: number, taskInstructionId: number): Promise<void> {
    await pgutil.delete(`DELETE FROM working_info WHERE worker_id=${workerId}`)
    return await pgutil.insert(`INSERT INTO working_info (worker_id, task_instruction_id) VALUES (${workerId}, ${taskInstructionId})`)
  },
  async clearWorkingInfo(workerId: number): Promise<void> {
    await pgutil.delete(`DELETE FROM working_info WHERE worker_id=${workerId}`)
  },
  async getOptimizationInput(workerId: number): Promise<any> {
    const assignableTasks = await tiModel.getAssignableTasks(await tiModel.getWorkersGroupId(workerId))
    const currentTime = new Date().getTime() / 1000
    // const currentTime = 1634084572
    const initBase = await settingModel.getInitBase()
    console.log('initbase', initBase)
    const overtime = (await settingModel.getOvertime()).toString()
    const walkCost = await settingModel.getWalkingCost()
    const walkSpeed = await settingModel.getWalkingTime()
    const terms = await settingModel.getTerms()
    // const terms = [
    //   {
    //     "start": "22:00",
    //     "finish": "05:00"
    //   },
    // ]
    const restTimes = await settingModel.getRestTimes()
    const result = {
      // "current_time": 1611277200.0,
      // "init_base": "I1",
      // "overtime": "1200",
      // "worker": {
      //   "walk_cost": 1.23,
      //   "walk_speed": 1.0
      // },
      // "terms": [
      //   {
      //     "start": "09:00",
      //     "finish": "16:00"
      //   },
      //   {
      //     "start": "16:30",
      //     "finish": "21:00"
      //   }
      // ],
      // "rest_times": [
      //   {
      //     "start": "08:30",
      //     "finish": "08:40"
      //   },
      //   {
      //     "start": "10:40",
      //     "finish": "11:25"
      //   },
      //   {
      //     "start": "13:25",
      //     "finish": "13:35"
      //   },
      //   {
      //     "start": "18:35",
      //     "finish": "18:45"
      //   },
      //   {
      //     "start": "20:45",
      //     "finish": "21:30"
      //   },
      //   {
      //     "start": "23:30",
      //     "finish": "23:40"
      //   }
      // ],
      tasks: assignableTasks,
      current_time: currentTime,
      init_base: initBase,
      worker: {
        walk_cost: walkCost,
        walk_speed: walkSpeed
      },
      overtime: overtime,
      terms: terms,
      rest_times: restTimes,
    }
    return result
  },
  async optimization(workerId: number): Promise<void> {
    const assignableTasks = await tiModel.getAssignableTasks(await tiModel.getWorkersGroupId(workerId))
    if (assignableTasks.length === 0) {
      // TODO かたらおさんに連絡?
      console.log('at === []')
      await tiModel.clearInstructions(workerId)
      return
    }
    // const currentTime = 1634084572
    const currentTime = new Date().getTime() / 1000
    const initBase = await settingModel.getInitBase()
    const overtime = (await settingModel.getOvertime()).toString()
    const walkCost = await settingModel.getWalkingCost()
    const walkSpeed = await settingModel.getWalkingTime()
    const terms = await settingModel.getTerms()
    const restTimes = await settingModel.getRestTimes()
    const requestData = {
      tasks: assignableTasks,
      // "current_time": 1611277200.0,
      // "init_base": "I1",
      // "overtime": "1200",
      // "worker": {
      //   "walk_cost": 1.23,
      //   "walk_speed": 1.0
      // },
      // "terms": [
      //   {
      //     "start": "09:00",
      //     "finish": "16:00"
      //   },
      //   {
      //     "start": "16:30",
      //     "finish": "21:00"
      //   }
      // ],
      // "rest_times": [
      //   {
      //     "start": "08:30",
      //     "finish": "08:40"
      //   },
      //   {
      //     "start": "10:40",
      //     "finish": "11:25"
      //   },
      //   {
      //     "start": "13:25",
      //     "finish": "13:35"
      //   },
      //   {
      //     "start": "18:35",
      //     "finish": "18:45"
      //   },
      //   {
      //     "start": "20:45",
      //     "finish": "21:30"
      //   },
      //   {
      //     "start": "23:30",
      //     "finish": "23:40"
      //   }
      // ],
      current_time: currentTime,
      init_base: initBase,
      worker: {
        walk_cost: walkCost,
        walk_speed: walkSpeed
      },
      overtime: overtime,
      terms: terms,
      rest_times: restTimes,
    }
    const result = await request(requestData)
    if (!result.tasks) {
      console.log(result)
      const fileName = 'input-' + toISOStringWithTimezone(new Date()) + '.json'
      await fs.writeFileSync('error-logs/realtime/' + fileName, JSON.stringify(requestData, null, '  '))
      console.log('Invalid type of optimization result. saved request data.')
    } else {
      const taskInstructions = result.tasks.map((i: any) => {
        const task_id = i.id
        const dueTimeStart = toISOStringWithTimezone(new Date(i.exchange_time*1000))
        const dueTimeEnd = toISOStringWithTimezone(new Date(i.work_finish_time*1000))
        return {
          task_id, dueTimeEnd, dueTimeStart, ...i
        }
      })
      console.log('opt ids', taskInstructions.map((i: any) => i.task_id))
      await tiModel.clearInstructions(workerId)
      if (taskInstructions.length > 0) {
        const originId = await tiModel.storeTaskInstructions(taskInstructions, workerId)
        await this.setWorkingInfo(workerId, originId)
      }
    }
  },
  async getAllTaskForGroup(groupId: number) {
    const categories = await pgutil.select(`SELECT category_name FROM assigned_categories WHERE group_id=${groupId}`)
    if (categories.length > 0) {
      const queryCategories = categories.reduce((pre, cur) => (pre + "'" + cur.category_name + "',"), "")
      return await pgutil.select(`SELECT * FROM datasheet WHERE task_category in (${queryCategories.slice(0, queryCategories.length - 1)})`)
    } else {
      return []
    }
  },
  async setAssignableTasks(groupId: number, taskIds: number[]): Promise<void> {
    console.log('gi', groupId, 'ti', taskIds)
    await pgutil.delete(`DELETE FROM assignable_tasks WHERE group_id=${groupId}`)
    for (let i of taskIds) {
      await pgutil.insert(`INSERT INTO assignable_tasks (group_id, task_id) VALUES (${groupId}, ${i})`)
    }
  },
  async getGroupIdOfWorker(workerId: number): Promise<number | undefined> {
    const workers = await pgutil.select(`SELECT * FROM workers WHERE id=${workerId}`)
    if (workers.length > 0) return workers[0].group_id
    return undefined
  },
  async getAllGroupsBriefStatus(): Promise<any> {
    const workerGroups = await pgutil.select(`SELECT * FROM worker_groups ORDER BY id`)
    console.log(workerGroups)
    const groupsBriefStatus = workerGroups.map(i => ({
      id: i.id,
      name: i.name,
      workersStatus: [] as any[],
      reliefWorkersStatus: [] as any[]
    }))
    const allWorkers = await pgutil.select(`SELECT * FROM working_info`)
    for (const i of allWorkers) {
      const worker = await workerModel.getWorker(i.worker_id)
      const group = groupsBriefStatus.find(g => g.id === worker.groupId)
      if (group) {
        const currentTaskInstruction = await tiModel.getTaskInstructionComplemented(i.task_instruction_id)
        if (worker.isRelief) {
          group.reliefWorkersStatus.push({
            worker,
            currentTaskInstruction
          })
        } else {
          group.workersStatus.push({
            worker,
            currentTaskInstruction
          })
        }
      }
    }
    console.log(groupsBriefStatus)
    return groupsBriefStatus.map(i => ({
      name: i.name,
      workersStatus: i.workersStatus,
      reliefWorkersStatus: i.reliefWorkersStatus,
    }))
  },
  async getWorkingTaskInstructionId(workerId: number): Promise<number | undefined> {
    const workerInfoList = await pgutil.select(`SELECT * FROM working_info WHERE worker_id=${workerId}`)
    if (workerInfoList.length === 0) {
      return undefined
    } else {
      return workerInfoList[0].task_instruction_id
    }
  },
  async getAllWorkingInfo(): Promise<{task_instruction_id: number, worker_id: number}[]> {
    return await pgutil.select(`SELECT * FROM working_info`)
  },
  async getWorkingTaskInstruction(workerId: number): Promise<TaskInstructionComplemented | undefined> {
    const taskInstructionId = await this.getWorkingTaskInstructionId(workerId)
    if (taskInstructionId === undefined) {
      return undefined
    } else {
      return await tiModel.getTaskInstructionComplemented(taskInstructionId)
    }
  },
  async getMapInfoList(): Promise<WorkerMapInfo[]> {
    const workerInfoList = await this.getAllWorkingInfo()
    const mapInfoList = []
    for (const workingInfo of workerInfoList) {
      const worker = await workerModel.getWorker(workingInfo.worker_id)
      const taskInstruction = await tiModel.getTaskInstructionComplemented(workingInfo.task_instruction_id)
      if (!taskInstruction) {
        return []
      }
      const task = taskInstruction.task
      const position = await getPositionFromId(name2id(task.base))
      let ret: WorkerMapInfo = {
        worker: worker,
        currentTaskInfo: {
          task,
          position
        },
        isMoving: false,
        nextTaskInfo: undefined,
        pathPositions: undefined
      }
      if (taskInstruction.startAt != null) {
        const ti = await tiModel.getTaskInstruction(taskInstruction.id)
        if (!!ti && !!ti.next_id) {
          const next = (await tiModel.getTaskInstructionComplemented(ti.next_id))
          if (!next) {
            return []
          }
          ret.isMoving = true
          ret['nextTaskInfo'] = {
            task: next.task,
            position: getPositionFromId(name2id(next.task.base))
          }
          ret['pathPositions'] = getPathPositions(name2id(task.base), name2id(next.task.base))
        }
      }
      mapInfoList.push(ret)
    }
    return mapInfoList
  },
  async getMapPoints(workerId: number): Promise<{x: number, y: number}[]> {
    const taskInstructionId = await this.getWorkingTaskInstructionId(workerId)
    if (!taskInstructionId) {
      return []
    }
    const allTaskInstructions = await tiModel.getAllTaskInstructionsComplemented(taskInstructionId)
    let points = []
    for (const ti of allTaskInstructions) {
      const point = await getPositionFromId(name2id(ti.task.base))
      points.push(point)
    }
    return points
  },
  async getPathPositionLists(workerId: number): Promise<{x: number, y: number}[][]> {
    const taskInstructionId = await this.getWorkingTaskInstructionId(workerId)
    if (!taskInstructionId) {
      return []
    }
    const allTaskInstructions = await tiModel.getAllTaskInstructionsComplemented(taskInstructionId)
    let points = []
    for (let i = 0; i < allTaskInstructions.length - 1; i++) {
      points.push(getPathPositions(name2id(allTaskInstructions[i].task.base), name2id(allTaskInstructions[i + 1].task.base)))
    }
    return points
  },
  async startTask(workerId: number): Promise<{success: boolean}> {
    const taskInstructionId = await this.getWorkingTaskInstructionId(workerId)
    if (!taskInstructionId) return {success: false}
    const startAt = toISOStringWithTimezone(new Date())
    await pgutil.update(`UPDATE task_instructions SET start_at='${startAt}' WHERE id=${taskInstructionId}`)
    return {success: true}
  },
  async finishTask(workerId: number): Promise<{success: boolean}> {
    const taskInstructionId = await this.getWorkingTaskInstructionId(workerId)
    if (!taskInstructionId) return {success: false}
    const taskInstruction = await tiModel.getTaskInstructionComplemented(taskInstructionId)
    if (!taskInstruction) return {success: false}
    const endAt = toISOStringWithTimezone(new Date())
    await pgutil.update(`UPDATE task_instructions SET end_at='${endAt}' WHERE id=${taskInstructionId}`)
    const worker = await workerModel.getWorker(workerId)
    await logModel.addWorkingLogs({
      ...taskInstruction,
      endAt: endAt
    }, {
      id: workerId,
      name: worker.name,
      group_id: worker.groupId,
      is_relief: worker.isRelief
    })
    const taskId = taskInstruction.task.id
    if (!taskId) return {success: false}
    if (taskInstruction.task.task_type === '定量作業') {
      await this.resetCount(taskId)
    } else {
      await taskModel.incrementCount(taskId)
    }
    await ptModel.changeToolPossessFlag(taskId, false)
    if (taskInstruction.enable_optimization) {
      await this.optimization(workerId)
    } else {
      try {
        const ti = await tiModel.getTaskInstruction(taskInstructionId)
        if (ti && ti.next_id) {
          await this.setWorkingInfo(workerId, ti.next_id)
        } else {
          this.clearWorkingInfo(workerId)
        }
      } catch(e) {

      }
    }
    return {success: true}
  },
  async cancelStart(workerId: number): Promise<{success: boolean}> {
    const taskInstructionId = await this.getWorkingTaskInstructionId(workerId)
    if (!taskInstructionId) return {success: false}
    await pgutil.update(`UPDATE task_instructions SET start_at=NULL WHERE id=${taskInstructionId}`)
    return {success: true}
  },
  async cancelFinish(workerId: number): Promise<{success: boolean}> {
    // TODO 定量定量作業以外
    const latestLog = await logModel.popLatestWorkingLog(workerId)
    if (!latestLog) return {success: false}
    // カウントを元に戻す
    await this.setCount(latestLog.task_id, parseInt(latestLog.actual_remaining_count))
    // ツール保持情報を元に戻す
    await ptModel.changeToolPossessFlag(latestLog.task_id, true)
    const current = await this.getWorkingTaskInstruction(workerId)
    const ti = await tiModel.storeTaskInstruction({
      id: -1,
      task_id: latestLog.task_id,
      working_time: parseInt(latestLog.working_time),
      dueTimeStart: toISOStringWithTimezone(new Date(latestLog.exchange_time)),
      dueTimeEnd: toISOStringWithTimezone(new Date(latestLog.expected_finish_time)),
      next_id: null,
      previous_id: null,
      startAt: toISOStringWithTimezone(new Date(latestLog.actual_start_time)),
      expected_moving_distance: parseInt(latestLog.expected_moving_distance),
      expected_latency_time: parseInt(latestLog.expected_latency_time),
      expected_drill_life_loss: parseInt(latestLog.expected_drill_life_loss)
    }, workerId)
    if (current) {
      await tiModel.setNextId(ti.id, current.id)
    }
    return {success: true}
  },
  async isWorking(workerId: number): Promise<{working: boolean}> {
    const taskInstructionId = await this.getWorkingTaskInstructionId(workerId)
    if (!taskInstructionId) return {working: false}
    const taskInstruction = await tiModel.getTaskInstruction(taskInstructionId)
    if (!taskInstruction) return {working: false}
    if (taskInstruction.startAt) {
      return {working: true}
    } else {
      return {working: false}
    }
  },
  async getWorkingInfo(workerId: number): Promise<{worker_id: number, task_instruction_id: number} | undefined> {
    const workingInfo = await pgutil.select(`SELECT * FROM working_info WHERE worker_id=${workerId}`)
    if (workingInfo.length > 0) return workingInfo[0]
    return undefined
  },
  async testOptimizasion(workerId: number): Promise<any> {
    const workingInfo = await this.getWorkingInfo(workerId)
    console.log(data)
    if (!workingInfo) return []
    return await request(data)
  },
  async optimizeOverall(): Promise<{success: boolean}> {
    // const currentTime = 1634084572
    const currentTime = new Date().getTime() / 1000
    const initBase = await settingModel.getInitBase()
    const overtime = (await settingModel.getOvertime()).toString()
    const walkCost = await settingModel.getWalkingCost()
    const walkSpeed = await settingModel.getWalkingTime()
    const terms = await settingModel.getTerms()
    const restTimes = await settingModel.getRestTimes()
    const groups = await pgutil.select(`SELECT id FROM worker_groups`)
    for (let g of groups) {
      const tasks = await this.getAllTaskForGroup(g.id)
      console.log(tasks)
      if (!tasks || tasks.length === 0) {
        await this.setAssignableTasks(g.id, [])
        continue
      }
      const requestData = {
        tasks: tasks,
        // current_time: currentTime,
        current_time: new Date().getTime() / 1000,
        init_base: initBase,
        overtime: overtime,
        worker: {
          walk_cost: walkCost,
          walk_speed: walkSpeed
        },
        // terms: [
        //   {
        //     start: "09:00",
        //     finish: "16:00"
        //   },
        //   {
        //     start: "16:30",
        //     finish: "21:00"
        //   }
        // ],
        terms,
        rest_times: restTimes,
      }
      const result = await overall(requestData)
      if (!result.ids) {
        const fileName = 'input-' + toISOStringWithTimezone(new Date()) + '.json'
        await fs.writeFileSync('error-logs/overall/' + fileName, JSON.stringify(requestData, null, '  '))
        console.log('Invalid type of optimization result. saved request data.')
      } else {
        await this.setAssignableTasks(g.id, result.ids)
      }
    }
    return {success: true}
  },
  async getReliefTaskList(workerId: number): Promise<TaskInstructionComplemented[]> {
    const groupId = await this.getGroupIdOfWorker(workerId)
    const workingInfoList = await this.getAllWorkingInfo()
    let workingIdsJoined = workingInfoList.reduce((pre: string, cur) => (pre + "'" + cur.worker_id + "',"), "")
    workingIdsJoined = workingIdsJoined.slice(0, workingIdsJoined.length - 1)
    const worker = await pgutil.select(`SELECT * FROM workers WHERE group_id=${groupId} AND id in (${workingIdsJoined})`)
    if (worker.length === 0) {
      return []
    } else {
      const workingInfo = workingInfoList.find((i: any) => i.worker_id === worker[0].id)
      if (!workingInfo) return []
      const taskInstructionId = workingInfo.task_instruction_id
      return await tiModel.getAllTaskInstructionsComplemented(taskInstructionId)
    }
  }
}
