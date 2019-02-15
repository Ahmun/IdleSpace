import { ResourceManager } from "./resource/resourceManager";

export class Game {
  resourceManager: ResourceManager;

  constructor() {
    this.resourceManager = new ResourceManager();

    this.resourceManager.metal.quantity = new Decimal(10000);
    this.resourceManager.crystal.quantity = new Decimal(10000);
  }
  update(diff: number): void {
    while (diff > 0) {
      let resEnded = false;
      this.resourceManager.loadPolynomial();
      let max = this.resourceManager.loadEndTime();
      if (max < diff) {
        max = diff;
        resEnded = true;
      }
      max = Math.min(max, diff);
      diff -= max;
      if (max > 0) this.resourceManager.update(max);
      if (resEnded) {
        this.resourceManager.stopResource();
      }
    }
    this.resourceManager.loadPolynomial();
    this.resourceManager.reloadActions();
    this.resourceManager.unlockedResources.forEach(r => r.setABC());
  }
  reload() {
    this.resourceManager.loadPolynomial();
    this.resourceManager.loadEndTime();
  }
  save(): any {
    const save: any = {};
    save.r = this.resourceManager.getSave();
    return save;
  }
  load(data: any) {
    if (!("r" in data)) return false;
    this.resourceManager.load(data.r);
  }
}
