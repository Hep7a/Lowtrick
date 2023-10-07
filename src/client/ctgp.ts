import { LowtrickCTGP } from "../ctgp_lib"
import CTGP from "ctgp-rest"

export class CTGPClient {
  originalTrackDict = {
    "lc": "Luigi Circuit",
    "mmm": "Moo Moo Meadows",
    "mg": "Mushroom Gorge",
    "tf": "Toad's Factory",
    "mc": "Mario Circuit",
    "cm": "Coconut Mall",
    "dks": "DK Summit",
    "wgm": "Wario's Gold Mine",
    "dc": "Daisy Circuit",
    "kc": "Koopa Cape",
    "mt": "Maple Treeway",
    "gv": "Grumble Volcano",
    "ddr": "Dry Dry Ruins",
    "mh": "Moonview Highway",
    "bc": "Bowser's Castle",
    "rr": "Rainbow Road",
    "rpb": "GCN Peach Beach",
    "ryf": "DS Yoshi Falls",
    "rgv2": "SNES Ghost Valley 2",
    "rmr": "N64 Mario Raceway",
    "rsl": "N64 Sherbet Land",
    "rsgb": "GBA Shy Guy Beach",
    "rds": "DS Delfino Square",
    "rws": "GCN Waluigi Stadium",
    "rdh": "DS Desert Hills",
    "rbc3": "GBA Bowser Castle 3",
    "rdkjp": "N64 DK's Jungle Parkway",
    "rmc": "GCN Mario Circuit",
    "rmc3": "SNES Mario Circuit 3",
    "rpg": "DS Peach Gardens",
    "rdkm": "GCN DK Mountain",
    "rbc": "N64 Bowser's Castle"
  }

  categoryDict: [string, number, string, string][] = [
    ["normal", 0, "00", ""],
    ["glitch", 1, "01", " (Glitch)"],
    ["no-shortcut", 2, "02", " (No Shortcut)"],
    ["shortcut", 16, "00", " (Shortcut)"]
  ]

  private helper: LowtrickCTGP;
  
  constructor() {
    this.helper = new LowtrickCTGP(this)
  }
  
  async start() {
    await this.helper.init()
  }

  async getTops(trackName: string, category: number, amount: number) {
    const obj = await this.helper.getLeaderboard(trackName, category)
    if (!obj) return null
    for (const ghost of obj.ghosts) {
      console.log(ghost)
    }
    return {
      ghosts: obj.ghosts.slice(0, amount),
      timestamp: obj.updateTimestamp
    }
  }

  async getWRS() {
    const tracks = await CTGP.getOriginalTracks()
    return tracks.leaderboards.map(x => {
      return {
        track: x.name,
        wrTime: x.fastestTimeSimple,
        category: x["categoryId"] ?? 0
      }
    })
  }
}