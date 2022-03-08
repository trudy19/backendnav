import express from 'express'
import pgutil from '../utils/postgres'
import workerModel, {Worker} from "./workers";

export type WorkerGroupComplemented = {
  id: number
  name: string
  workers: Worker[]
  reliefWorkers: Worker[]
}

export type WorkerGroup = {
  id: number
  name: string
}

export default {
  async getWorkerGroups(): Promise<WorkerGroup[]> {
    return await pgutil.select(`SELECT * FROM worker_groups`)
  },
  async getWorkerGroupsComplemented(): Promise<WorkerGroupComplemented[]> {
    const workerGroups = await this.getWorkerGroups()
    if (workerGroups === null) return []
    let workerGroupsComplemented = workerGroups.map(g => ({
      id: g.id,
      name: g.name,
      workers: [] as Worker[],
      reliefWorkers: [] as Worker[]
    }))
    for (let group of workerGroupsComplemented) {
      const workers = await workerModel.getWorkers(group.id, false)
      if (workers != null) {
        group.workers = workers
      }
    }
    for (let group of workerGroupsComplemented) {
      const reliefWorkers = await workerModel.getWorkers(group.id, true)
      if (reliefWorkers != null) {
        group.reliefWorkers = reliefWorkers
      }
    }
    return workerGroupsComplemented
  }
}
