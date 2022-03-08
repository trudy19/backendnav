import {Request} from 'zeromq'
const sock = new Request()
sock.connect("tcp://127.0.0.1:6661")
console.log("Producer bound to port 6661")

export async function overall(task: any) {
  await sock.send(JSON.stringify(task))
  const [result] = await sock.receive()

  console.log(JSON.parse(result.toString()))
  return JSON.parse(result.toString())
}
