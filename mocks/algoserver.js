function optimize(tasks) {
  return {
    tasks: tasks.map(t => {
      const exchange_time = new Date().getTime() / 1000
      const work_finish_time = exchange_time + 200
      return {
        ...t,
        exchange_time,
        work_finish_time
      }
    })
  }
}

module.exports = optimize
