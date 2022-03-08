import pgutil from '../utils/postgres'

export default {
  async getOvertime(): Promise<{overtime: number}> {
    return (await pgutil.select(`SELECT overtime FROM settings`))[0].overtime
  },
  async setOvertime(overtime: number): Promise<number> {
    await pgutil.update(`UPDATE settings SET overtime=${overtime}`)
    return overtime
  },
  async getWalkingTime(): Promise<{overtime: number}> {
    return (await pgutil.select(`SELECT walking_time FROM settings`))[0].walking_time
  },
  async setWalkingTime(walkingTime: number): Promise<number> {
    await pgutil.update(`UPDATE settings SET walking_time=${walkingTime}`)
    return walkingTime
  },
  async getWalkingCost(): Promise<{walkingCost: number}> {
    return (await pgutil.select(`SELECT walking_cost FROM settings`))[0].walking_cost
  },
  async setWalkingCost(walkingCost: number): Promise<number> {
    await pgutil.update(`UPDATE settings SET walking_cost=${walkingCost}`)
    return walkingCost
  },
  async getTerms(): Promise<{start: string, finish: string}[]> {
    const termsStr = (await pgutil.select(`SELECT terms FROM settings`))[0].terms
    return JSON.parse(termsStr)
  },
  async setTerms(terms: {start: string, finish: string}[]): Promise<void> {
    const termsStr = JSON.stringify(terms)
    await pgutil.update(`UPDATE settings SET terms='${termsStr}'`)
  },
  async getRestTimes(): Promise<{start: string, finish: string}[]> {
    const restTimesStr = (await pgutil.select(`SELECT rest_times FROM settings`))[0].rest_times
    return JSON.parse(restTimesStr)
  },
  async setRestTimes(restTimes: {start: string, finish: string}[]): Promise<void> {
    const restTimesStr = JSON.stringify(restTimes)
    await pgutil.update(`UPDATE settings SET rest_times='${restTimesStr}'`)
  },
  async getInitBase(): Promise<string> {
    return (await pgutil.select(`SELECT init_base FROM settings`))[0].init_base
  },
  async setInitBase(base: string): Promise<void> {
    await pgutil.update(`UPDATE settings SET init_base='${base}'`)
  }
}
