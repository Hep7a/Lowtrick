import { Client as DiscordClient, Collection, Message } from "discord.js"
import { readdirSync, lstatSync } from "fs"
import { CTGPClient } from "./ctgp"

export abstract class Command {
  name: string
  constructor(name: string) {
    this.name = name
  }

  abstract exec(client: BotClient, msg: Message, args: string[]): void | Promise<void>
}

export class BotClient {
  discord: DiscordClient
  ctgp: CTGPClient
  commands: Collection<string, Command>
  token: string

  constructor(token: string) {
    this.token = token
    this.discord = new DiscordClient({
      intents: [
        "Guilds",
        "GuildMessages",
        "GuildMembers",
        "MessageContent"
      ]
    })
    this.ctgp = new CTGPClient()
    this.commands = new Collection()
  }

  loadCommands(dir: string) {
    for (const cmdDir of readdirSync(dir)) {
      if (!cmdDir.endsWith(".js")) continue
      const cmdPath = `${dir}/${cmdDir}`
      if (lstatSync(cmdPath).isDirectory()) this.loadCommands(cmdPath) 
      else
        import(cmdPath)
          .then(({ default: commandClass }) => {
            const command = new commandClass()
            this.commands.set(command.name, command)
          })
          .catch(e => {
            console.log(`Failed to load path ${cmdPath}: ${e}`)
          })
        
    }
  }

  handleMessage(msg:Message) {
    if (msg.author.bot) return
    const PREFIX = "!"
      if (!msg.content.startsWith(PREFIX)) return
      const args = msg.content.toLowerCase().slice(PREFIX.length).split(" ")
      if (this.commands.has(args[0])) this.commands.get(args[0]).exec(this, msg, args)
  }
  
  async start() {
    try {
      this.ctgp.start()
      this.discord.login(this.token)
      this.discord.on('ready', () => {
        console.log("its been 84 years")
      })
      this.discord.on('messageCreate', msg => {
        this.handleMessage(msg)
      })
    } catch (e) {
      console.log(e)
    }
  }
}