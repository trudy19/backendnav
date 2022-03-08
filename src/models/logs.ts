import pgutil from '../utils/postgres'

export type ErrorLog = {
  id: number
  service_name: string
  date: number
  message: string
}

export default {
  async getErrorLogs(): Promise<ErrorLog[]> {
    return await pgutil.select(`SELECT * FROM error_logs ORDER BY id`)
  },
  async addErrorLog(serviceName: string, message: string): Promise<ErrorLog> {
    return await pgutil.insert(`INSERT INTO error_logs
    (service_name, date, message)
    VALUES ('${serviceName}', '${(new Date).toISOString()}', '${message}')`)
  },
  async clearErrorLogs(): Promise<{success: boolean}> {
    return await pgutil.delete((`DELETE FROM error_logs`))
  }
}
