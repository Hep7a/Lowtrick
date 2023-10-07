import CTGP, { Types, Util } from "ctgp-rest"
import { connect, connection, Schema, model } from "mongoose"
import fetch, { RequestInit } from "node-fetch"
import { CTGPClient } from "./client/ctgp"

interface ITrackSchema {
  track: string;
  category: number
  ghosts: Types.Responses.Ghost[];
  updateTimestamp: number;
}

const trackSchema = new Schema<ITrackSchema>({
  track: { type: String, required: true },
  category: { type: Number, required: true },
  ghosts: { type: [], required: true },
  updateTimestamp: { type: Number, required: true, default: Date.now() }
})

const TrackModel = model<ITrackSchema>("Track", trackSchema)

export class LowtrickCTGP {
  private isFetching: boolean

  constructor(private client: CTGPClient) {
    this.isFetching = false
  }
  
  async init() {
    await connect(process.env["MONGO_URL"])

    // incase schema change
    let toggle = true
    if (!toggle) {
      console.log("Clearing database...")
      // await TrackModel.deleteMany({})
      console.log("Cleared database.")
    }
  }

  private async _getTrackLeaderboard(hash, categoryPath) {
    if (this.isFetching) {
      console.log("busy rn")
      return null
    }
    this.isFetching = true
    return await CTGP.getTrack(hash, categoryPath)
  }

  async getLeaderboard(name: string, category: number): Promise<any> {
    let track = await TrackModel.findOne({
      track: name,
      category
    })
    if (!track) {
      console.log(`Track ${name} not in cache.`)
      track = await this.fetchLeaderboard(name, category)
    } else console.log(`Found track ${name} in cache.`)
    if ((Date.now() - track.updateTimestamp) >= 20*60*1000) {
      console.log(`Data for track ${name} might be out of date, updating...`)
      setTimeout(async () => {
        await this.fetchLeaderboard(name, category)
      }, 1000)
    }
    return track
  }

  public async fetchLeaderboard(name: string, category: number) {
    console.log(`Fetching hash for track ${name}...`)
    const tracks = await CTGP.getOriginalTracks()
    const matchingTracks = tracks.leaderboards.filter(x => x.name === name)
    /* 
    00 (1 category) => main lb
    00 (>1 category) => no-glitch
    */
    if (matchingTracks.length > 1 && category === 0) {
      console.log(matchingTracks)
      category = 2
    }
    const track = matchingTracks.find(x => {
      const categoryId = x["categoryId"] ?? 0
      return categoryId === category
    })
    const categoryPath = this.client.categoryDict.find(x => x[1] === category)[2]
    const hash = track.slotId.toString(16).padStart(2, "0") + track.trackId
    console.log(`Fetching track ${name} from API...`)

    const lb = await this._getTrackLeaderboard(hash, categoryPath)

    if (!lb) {
      console.log("Busy fetching different track.")
      return
    }
    
    console.log(`Adding track ${name} to cache...`)
    
    let ghosts = []
    let playerIds = []
    let i=0
    let count=0
    console.log(lb.ghosts[0])
    while (ghosts.length < Math.min(10, lb.ghosts.length-1)) {
      const ghost = lb.ghosts[i]
      i++
      if (playerIds.includes(ghost.playerId)) continue
      playerIds.push(ghost.playerId)
      count++
      const ghostObj = {
        name: ghost.player,
        category: track["categoryId"],
        finishTime: ghost.finishTimeSimple,
        position: count
      }
      ghosts.push(ghostObj)
    }
    
    return await TrackModel.findOneAndUpdate({ track: name, category }, {
      track: name,
      category,
      ghosts,
      updateTimestamp: Date.now()
    }, { upsert: true, new: true })
  }
}