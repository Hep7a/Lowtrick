import { Command } from "../client/client"
import { ButtonBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle } from "discord.js"

export default class WRSCommand extends Command {
  constructor() {
    super("wrs")
  }

  async exec(client, msg, args) {
    await msg.channel.send("Hold on, this may take a while...")
    const now = Date.now()
    const tracks = await client.ctgp.getWRS()
    const delay = Math.floor(Date.now() - now)
    
    const cupNames = [
      "Mushroom Cup",
      "i forgor",
      "Star Cup",
      "Special Cup",
      "Shell Cup",
      "Banana Cup",
      "i forgor",
      "Lightning Cup"
    ]

    const fullTrackNames = Object.values(client.ctgp.originalTrackDict)
    let fieldArr = []
    let cupArr = []
    let currTrack = fullTrackNames[0]

    for (let i=0; i<tracks.length; i++) {
      const obj = tracks[i]
      if (currTrack !== obj.track) {
        if (fullTrackNames.indexOf(obj.track) % 4 === 0) {
          fieldArr.push(cupArr)
          cupArr = []
        }
        currTrack = obj.track
      }
      const categorySuffix = client.ctgp.categoryDict.find(x => x[1] === obj.category)[3]
      cupArr.push({
        name: `${obj.track}${categorySuffix}`,
        value: obj.wrTime
      })
    }
    fieldArr.push(cupArr)

    let page = 0
    const getActionRow = () => {
      const nextPage = new ButtonBuilder()
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("next-page")
        .setDisabled(page+1 >= fieldArr.length ? true : false)

      const prevPage = new ButtonBuilder()
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("prev-page")
        .setDisabled(page-1 < 0 ? true : false)

      return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(prevPage, nextPage)
    }
    
    const getEmbed = () => { 
      return new EmbedBuilder()
        .setTitle("Original Tracks WRs")
        .addFields(fieldArr[page])
        .setFooter({text:`Page ${page+1} of ${fieldArr.length}`})
    }

    const response = await msg.channel.send({
      embeds: [getEmbed()],
      components: [getActionRow()]
    })

    const collector = response.createMessageComponentCollector({
      filter: i => i.user.id === msg.author.id,
      time: 300_000
    })

    collector.on('collect', async i => {
      switch (i.customId) {
        case "prev-page":
          page--
          break;
        case "next-page":
          page++
      }
      await i.update({
        embeds: [getEmbed()],
        components: [getActionRow()]
      })
    })

    collector.on('end', () => {
      msg.channel.send("Closed automatically after 5 minutes.")
    })
  }
}