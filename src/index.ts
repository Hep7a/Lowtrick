import { BotClient } from "./client/client"

const bot = new BotClient(process.env["BOT_TOKEN"])

bot.loadCommands(`${__dirname}/commands`)
bot.start().catch(e => console.log(e))