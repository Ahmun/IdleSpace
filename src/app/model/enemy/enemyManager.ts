import { Enemy } from "./enemy";
import { ISalvable } from "../base/ISalvable";
import { BattleService } from "src/app/battle.service";
import { FleetManager } from "../fleet/fleetManager";
import { BattleRequest } from "src/app/workers/battleRequest";
import { Reward } from "./reward";
import { ResourceManager } from "../resource/resourceManager";

export class EnemyManager implements ISalvable {
  private static instance: EnemyManager;
  currentEnemy: Enemy;
  allEnemy = new Array<Enemy>();
  maxLevel = 1;
  battleService: BattleService;
  inBattle = false;

  static GetInstance(): EnemyManager {
    return EnemyManager.instance;
  }
  constructor() {
    EnemyManager.instance = this;
  }
  generate() {
    this.allEnemy.push(Enemy.generate(1));
  }
  attack(enemy: Enemy): boolean {
    if (this.currentEnemy) return false;
    this.currentEnemy = enemy;
    this.allEnemy = this.allEnemy.filter(e => e !== enemy);
    this.currentEnemy.generateZones();
    return true;
  }
  getSave(): any {
    const data: any = {};
    if (this.maxLevel > 1) data.l = this.maxLevel;
    if (!!this.currentEnemy) data.c = this.currentEnemy.getSave();
    if (this.allEnemy.length > 0) data.a = this.allEnemy.map(e => e.getSave());

    return data;
  }
  load(data: any): boolean {
    if ("l" in data) this.maxLevel = data.l;
    if ("c" in data) this.currentEnemy = Enemy.fromData(data.c, true);
    if ("a" in data) {
      for (const enemyData of data.a) {
        this.allEnemy.push(Enemy.fromData(enemyData));
      }
    }
    if (
      this.currentEnemy &&
      (!this.currentEnemy.zones || this.currentEnemy.zones.length !== 100)
    ) {
      this.currentEnemy.generateZones();
    }
    return true;
  }
  startBattle() {
    if (this.inBattle || !this.currentEnemy) return false;

    FleetManager.getInstance().reload();
    this.currentEnemy.currentZone.reload();

    const battleRequest = new BattleRequest();
    battleRequest.playerFleet = FleetManager.getInstance().ships.map(s =>
      s.getShipData()
    );
    battleRequest.enemyFleet = this.currentEnemy.currentZone.ships.map(s =>
      s.getShipData()
    );
    this.battleService.battleWorker.postMessage(battleRequest);
  }
  onBattleEnd(result: BattleResult) {
    // console.log("On Battle End");
    result.enemyLost.forEach(e => {
      const ship = this.currentEnemy.currentZone.ships.find(s => s.id === e[0]);
      ship.quantity = ship.quantity.minus(Decimal.fromDecimal(e[1]));
    });
    result.playerLost.forEach(e => {
      const ship = FleetManager.getInstance().ships.find(s => s.id === e[0]);
      ship.quantity = ship.quantity.minus(Decimal.fromDecimal(e[1]));
    });
    this.currentEnemy.currentZone.reload();

    // Win
    if (result.result === "1") {
      this.maxLevel = Math.max(this.maxLevel, this.currentEnemy.level + 1);
      this.currentEnemy.currentZone.ships = null;
      this.currentEnemy.currentZone.originalNavCap = null;
      //#region Reward
      const currentZone = this.currentEnemy.currentZone;
      const resMan = ResourceManager.getInstance();
      if (currentZone.reward) {
        switch (currentZone.reward) {
          case Reward.HabitableSpace:
            resMan.habitableSpace.quantity = resMan.habitableSpace.quantity.plus(
              this.currentEnemy.level
            );
            break;
          case Reward.MetalMine:
            resMan.habitableSpace.quantity = resMan.miningDistrict.quantity.plus(
              this.currentEnemy.level
            );
            break;
          case Reward.CrystalMine:
            resMan.habitableSpace.quantity = resMan.crystalDistrict.quantity.plus(
              this.currentEnemy.level
            );
            break;
        }
      }
      //#endregion
      if (this.currentEnemy.currentZone.number >= 99) {
        this.currentEnemy = null;
      } else {
        this.currentEnemy.currentZone = this.currentEnemy.zones[
          this.currentEnemy.currentZone.number + 1
        ];
        this.currentEnemy.currentZone.generateShips(
          this.currentEnemy.shipsDesign
        );
        this.currentEnemy.currentZone.reload();
      }
    }

    this.inBattle = false;
  }
  delete(enemy: Enemy) {
    this.allEnemy = this.allEnemy.filter(e => e !== enemy);
  }
  surrender() {
    this.currentEnemy = null;
  }
}
