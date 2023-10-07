import { Command } from "../client/client"

export default class PingCommand extends Command {
  constructor() {
    super("ping")
  }

  async exec(client,msg,args) {
    const response = await msg.channel.send("Pong!")
    msg.channel.send(`Discord Latency: ${Date.now() - response.createdTimestamp}ms\nDiscord API Latency: ${client.discord.ws.ping}ms`)
  }
}