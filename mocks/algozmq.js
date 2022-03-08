const zmq = require("zeromq")

async function run() {
  const sock = new zmq.Reply

  await sock.bind("tcp://127.0.0.1:6655")

  for await (const [msg] of sock) {
    await sock.send(JSON.stringify(optimize(JSON.parse(msg))))
  }
}

run()

function optimize(req) {
  return {
    tasks: req.tasks.map(t => {
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
