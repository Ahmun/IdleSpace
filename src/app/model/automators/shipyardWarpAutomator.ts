import { Automator } from "./automator";
import { Shipyard } from "../shipyard/shipyard";
import { DarkMatterManager } from "../darkMatter/darkMatterManager";

export class ShipyardWarp extends Automator {
  constructor() {
    super("SyA");
    this.name = "Auto Shipyard Jobs Warp";
    this.description = "Automatically warp to complete jobs";
    this.prestigeLevel = 15;
  }
  execCondition(): boolean {
    return Shipyard.getInstance().totalTime > 1000;
  }
  doAction(): boolean {
    let requiredWarp = Shipyard.getInstance().totalTime;
    requiredWarp = Math.ceil(requiredWarp / (60 * 1000));
    console.log(requiredWarp);
    return DarkMatterManager.getInstance().warpMin.buy(
      new Decimal(requiredWarp)
    );
  }
}
