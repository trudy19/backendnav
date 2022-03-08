const zmq = require("zeromq")
const sock = new zmq.Request
sock.connect("tcp://127.0.0.1:6655")
console.log("Producer bound to port 6655")


export default async function request(task: any) {
  await sock.send(JSON.stringify(task))
  const [result] = await sock.receive()

  return JSON.parse(result.toString())
}
