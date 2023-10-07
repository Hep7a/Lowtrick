import { Command } from "../client/client"
import { EmbedBuilder } from "discord.js"

export default class TopCommand extends Command {
  constructor() {
    super("top")
  }

  async exec(client, msg, args) {
    let trackName = client.ctgp.originalTrackDict[args[1]]
    let categoryName = args[2] ?? "normal"
    let amount = parseInt(args[3])
    
    if (!trackName) {
      msg.channel.send("Invalid arguments. Valid examples: LC, DDR, rMC, rBC3, etc.")
      return
    }
    const categoryId = client.ctgp.categoryDict.find(x => x[0] === categoryName)[1]
    if (categoryId === null) {
      msg.channel.send("Invalid category. Valid examples: normal, no-shortcut, shortcut, glitch")
      return 
    }
    if (isNaN(amount) || amount > 10)
      amount = 10
    
    const response = await msg.channel.send("Hold on, this may take a while...")
    const tops = await client.ctgp.getTops(trackName, categoryId, amount)
    if (!tops) {
      msg.channel.send("Busy fetching a different track, try again later.")
      return
    }
    const {ghosts, timestamp} = tops
    const category = client.ctgp.categoryDict.find(x => x[1] === ghosts[0].category) ?? client.ctgp.categoryDict[0]
    console.log(ghosts[0].category, category[3])
    const date = new Date(timestamp)
    const embed = new EmbedBuilder()
      .setTitle(`${trackName}${category[3]} | Top ${amount}`)
      .addFields(ghosts.map(x => {
        return {
          name: `${x.position}) ${x.name}`,
          value: x.finishTime
        }
      }))
      .setFooter({text:`As of ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`})
    response.edit({
      embeds: [embed]
    })
  }
}