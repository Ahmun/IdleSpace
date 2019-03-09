import { Research } from "./research";
import { ResourceManager } from "../resource/resourceManager";
import { ResearchData } from "./researchData";

export class ResearchManager {
  private static instance: ResearchManager;

  researches = new Array<Research>();
  toDo = new Array<Research>();
  completed = new Array<Research>();

  //#region Researches
  betterResearch: Research;
  alloy: Research;
  //#region Ship Types
  corvette: Research;
  frigate: Research;
  destroyer: Research;
  cruiser: Research;
  battlecruiser: Research;
  battleship: Research;
  //#endregion
  //#endregion

  constructor() {
    ResearchManager.instance = this;

    for (const resData of ResearchData) {
      this.researches.push(Research.fromData(resData));
    }
    this.betterResearch = this.researches.find(r => r.id === "r");
    this.alloy = this.researches.find(r => r.id === "a");
    this.corvette = this.researches.find(r => r.id === "c");
    this.frigate = this.researches.find(r => r.id === "f");
    this.destroyer = this.researches.find(r => r.id === "d");
    this.cruiser = this.researches.find(r => r.id === "b");
    this.battlecruiser = this.researches.find(r => r.id === "t");
    this.battleship = this.researches.find(r => r.id === "s");

    this.toDo = [this.researches[0], this.researches[1]];
  }
  static getInstance() {
    return ResearchManager.instance;
  }

  setUnlocks() {
    this.researches.forEach(r => {
      const data = ResearchData.find(rd => rd.id === r.id);
      if (data.researchToUnlock) {
        for (const resToUnData of data.researchToUnlock) {
          const toUnlock = this.researches.find(res => res.id === resToUnData);
          r.toUnlock.push(toUnlock);
        }
      }

      if (data.resourceToUnlock) {
        for (const resToUnData of data.resourceToUnlock) {
          const toUnlock = ResourceManager.getInstance().allResources.find(
            res => res.id === resToUnData
          );
          r.toUnlock.push(toUnlock);
        }
      }

      if (data.otherToUnlock) {
        for (const toUnlockFun of data.otherToUnlock) {
          r.toUnlock.push(toUnlockFun());
        }
      }
    });
  }

  update(progress: Decimal) {
    while (progress.gt(0) && this.toDo.length > 0) {
      const res = this.toDo[0];
      progress = res.addProgress(progress);
      if (res.completed) {
        this.toDo.shift();
        this.completed.push(res);
      } else if (progress.gt(0)) {
        this.toDo.shift();
        this.toDo.push(res);
      }
    }
  }
  addAvailable(res: Research) {
    if (!res.completed && !this.toDo.includes(res)) this.toDo.push(res);
  }

  getSave(): any {
    const save: any = {};
    save.t = this.toDo.map(r => r.getSave());
    save.c = this.completed.map(r => r.getSave());
    return save;
  }
  load(data: any): boolean {
    this.toDo = [];
    this.completed = [];

    if ("t" in data) {
      for (const res of data.t) {
        const research = this.researches.find(u => u.id === res.i);
        if (research) {
          research.load(res);
          this.toDo.push(research);
        }
      }
    }

    if ("c" in data) {
      for (const res of data.c) {
        const research = this.researches.find(u => u.id === res.i);
        if (research) {
          research.load(res);
          research.done = true;
          this.completed.push(research);
        }
      }
    }

    return true;
  }
}
