import { Zone } from "./zone";
import { ShipDesign } from "../fleet/shipDesign";
import { MAX_NAVAL_CAPACITY } from "../fleet/fleetManager";
import { ShipTypes } from "../fleet/shipTypes";
import { Presets, Preset } from "./preset";
import sample from "lodash-es/sample";
import random from "lodash-es/random";
import { Reward } from "./reward";
import { enemyNames } from "./enemyNames";
import { enemySuffixes } from "./enemySuffixes";
import { enemyIcons } from "./enemyIcons";

export class Enemy {
  private static lastId = 0;

  name = "";
  level = 0;
  zones = new Array<Zone>();
  shipsDesign = new Array<ShipDesign>();
  totalFleetPower = new Decimal(0);
  id = 0;
  shape = "flask";
  currentZone: Zone;
  totalNavalCap = new Decimal(0);

  constructor() {
    Enemy.lastId++;
    this.id = Enemy.lastId;
  }

  static generate(level: number): Enemy {
    const enemy = new Enemy();
    enemy.level = level;
    enemy.name = sample(enemyNames) + " " + sample(enemySuffixes);
    enemy.generateIcon();
    const moduleLevelMulti = sample([1, 1.5, 2]);
    const moduleLevel = level * moduleLevelMulti;
    const navalCap =
      (MAX_NAVAL_CAPACITY * level) / (level + 500) / moduleLevelMulti;
    const maxShipTye = Math.min(level, ShipTypes.length);
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < maxShipTye; i++) {
        if (!(maxShipTye > 2 && Math.random() < 0.15)) {
          let presets = Presets.filter(p => p.type === ShipTypes[i]);
          const pres = sample(presets);
          enemy.addFromPreset(pres);
          if (presets.length > 2 && Math.random() < 0.3) {
            presets = presets.filter(p => p !== pres);
            const pres2 = sample(presets);
            enemy.addFromPreset(pres2);
          }
        }
      }
    }
    const totalWeight = enemy.shipsDesign
      .map(s => s.weight)
      .reduce((p, c) => p + c, 0);
    enemy.shipsDesign.forEach(sd => {
      const numOfShips = Math.max(
        Math.floor(
          (navalCap * sd.weight) / totalWeight / sd.type.navalCapacity
        ),
        1
      );
      sd.quantity = new Decimal(numOfShips);
      sd.modules.forEach(m => {
        m.level = moduleLevel;
      });
      sd.reload(false);
    });
    enemy.shipsDesign.sort((a, b) => {
      const a2 = a.armorDamage.div(a.shieldDamage);
      const b2 = b.armorDamage.div(b.shieldDamage);
      return a2.cmp(b2);
    });
    let n = 1;
    enemy.shipsDesign.forEach(s => {
      s.order = n;
      n++;
    });
    enemy.reload();
    return enemy;
  }
  static fromData(data: any, zone = false): Enemy {
    const enemy = new Enemy();
    if ("n" in data) enemy.name = data.n;
    if ("l" in data) enemy.level = data.l;
    if ("h" in data) enemy.shape = data.h;
    if ("s" in data) {
      for (const shipData of data.s) {
        const ship = new ShipDesign();
        ship.load(shipData);
        enemy.shipsDesign.push(ship);
      }
    }
    if (zone) {
      enemy.generateZones("z" in data);
      if ("z" in data) {
        for (let i = 0; i < data.z.length; i++) {
          enemy.zones[i].load(data.z[i]);
        }
      }
      if ("c" in data) {
        enemy.currentZone = enemy.zones[data.c];
        if (enemy.currentZone.ships.length < 1) {
          enemy.currentZone.generateShips(enemy.shipsDesign);
        }
      }
    }
    let n = 1;
    enemy.shipsDesign.forEach(s => {
      s.order = n;
      n++;
    });
    enemy.reload();
    return enemy;
  }

  reload() {
    this.totalNavalCap = new Decimal(0);
    this.totalFleetPower = new Decimal(0);
    this.shipsDesign.forEach(sd => {
      this.totalFleetPower = this.totalFleetPower.plus(
        sd.totalFleetPower.times(sd.quantity)
      );
    });
    this.totalNavalCap = ShipDesign.GetTotalNavalCap(this.shipsDesign);
    this.zones.forEach(z => {
      z.enemy = this;
    });
  }
  generateIcon() {
    if (this.name.includes("Paperclip")) {
      this.shape = "paperclip";
      return true;
    }
    if (this.name.includes("Printer")) {
      this.shape = "printer";
      return true;
    }
    this.shape = sample(enemyIcons);
  }
  generateZones(empty = false) {
    for (let i = 0; i < 100; i++) {
      const zone = new Zone();
      zone.number = i;
      this.zones.push(zone);
    }
    this.currentZone = this.zones[0];
    this.zones.forEach(z => {
      z.enemy = this;
    });
    if (!empty) {
      this.currentZone.generateShips(this.shipsDesign);
      //  Planet Reward for last row zones
      for (let i = 9; i < 100; i += 10) {
        this.zones[i].reward = Reward.HabitableSpace;
        let otherZones = new Array<Zone>();
        for (let k = 1; k < 10; k++) otherZones.push(this.zones[i - k]);
        for (let j = 0; j < 2; j++) {
          const rand = sample(otherZones);
          rand.reward = Reward.MetalMine;
          otherZones = otherZones.filter(z => !z.reward);
        }
        for (let j = 0; j < 2; j++) {
          const rand = sample(otherZones);
          rand.reward = Reward.CrystalMine;
          otherZones = otherZones.filter(z => !z.reward);
        }
      }

      this.zones.forEach(z => z.reload());
    }
  }
  private addFromPreset(pres: Preset) {
    const design = ShipDesign.fromPreset(pres);
    design.weight = random(1, 5);
    design.id = this.id + "-" + this.shipsDesign.length;
    this.shipsDesign.push(design);
  }
  getSave() {
    const data: any = {};
    data.h = this.shape;
    data.n = this.name;
    data.l = this.level;
    data.s = this.shipsDesign.map(s => s.getSave());
    if (this.zones && this.zones.length > 0) {
      data.z = this.zones.map(z => z.getSave());
    }
    if (this.currentZone) data.c = this.currentZone.number;

    return data;
  }
}
