import { Automator } from "./automator";
import { FleetManager } from "../fleet/fleetManager";

export class FleetAutomator extends Automator {
  constructor() {
    super("fla");
    this.name = "Auto Fleet Upgrade";
    this.stopWhenFactoryUi = false;
    this.description = "Auto Fleet Upgrade";
    this.prestigeLevel = 15;
  }
  doAction(): boolean {
    const fleetMan = FleetManager.getInstance();
    let done = false;
    fleetMan.ships
      .filter(s => !s.isUpgrading)
      .forEach(s => {
        if (!done) {
          s.copy();

          if (s.maxAll() && s.isValid) {
            s.saveConfig();
            done = true;
          }
        }
      });
    return done;
  }
}
