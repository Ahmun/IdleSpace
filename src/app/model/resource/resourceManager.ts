import { Resource } from "./resource";
import { ISalvable } from "../base/ISalvable";
import isArray from "lodash-es/isArray";
import { solveEquation } from "ant-utils";
import { ResourceGroup } from "./resourceGroup";
import { MultiPrice } from "../prices/multiPrice";
import { Price } from "../prices/price";
import { Action } from "../actions/abstractAction";
import { Shipyard } from "../shipyard/shipyard";
import { Bonus } from "../bonus/bonus";
import { EnemyManager } from "../enemy/enemyManager";
import { MainService } from "src/app/main.service";
import { FleetManager } from "../fleet/fleetManager";
import { AllSkillEffects } from "../prestige/allSkillEffects";

const TIER_2_COST_MULTI = 100;
const TIER_3_COST_MULTI = 1000;
const TIER_2_ALLOY_PERCENT = 1;
const TIER_3_ALLOY_PERCENT = 1;

export class ResourceManager implements ISalvable {
  private static instance: ResourceManager;

  unlockedResources: Resource[];
  unlockedProdResources: Resource[];
  limitedResources: Resource[];
  allResources: Resource[];
  tierGroups: ResourceGroup[];
  unlockedTierGroups: ResourceGroup[];

  //#region Resources
  metal: Resource;
  crystal: Resource;
  alloy: Resource;
  energy: Resource;
  computing: Resource;
  habitableSpace: Resource;
  miningDistrict: Resource;
  crystalDistrict: Resource;

  metalX1: Resource;
  metalX2: Resource;
  metalX3: Resource;

  crystalX1: Resource;
  crystalX2: Resource;
  crystalX3: Resource;

  alloyX1: Resource;
  alloyX2: Resource;
  alloyX3: Resource;

  energyX1: Resource;
  energyX2: Resource;
  energyX3: Resource;

  computingX1: Resource;
  computingX2: Resource;
  computingX3: Resource;

  shipyardX1: Resource;
  shipyardX2: Resource;
  shipyardX3: Resource;
  shipyardProgress: Resource;

  searchX1: Resource;
  searchX2: Resource;
  searchX3: Resource;
  searchProgress: Resource;

  warriorX1: Resource;
  warriorX2: Resource;
  warriorX3: Resource;
  // #endregion
  //#region group
  materials: Resource[];
  districts: Resource[];
  matGroup: ResourceGroup;
  tier1: Resource[];
  tier2: Resource[];
  tier3: Resource[];
  matNav: Resource[];

  limited: Resource[];
  //#endregion

  unitZero: Resource;
  maxTime: number = Number.POSITIVE_INFINITY;

  constructor() {
    ResourceManager.instance = this;

    //#region Materials
    this.metal = new Resource("m");
    this.metal.shape = "metal";
    this.metal.unlocked = true;

    this.crystal = new Resource("c");
    this.crystal.shape = "crystal";
    this.crystal.unlocked = true;

    this.alloy = new Resource("a");
    this.alloy.shape = "alloy";

    this.energy = new Resource("e");
    this.energy.shape = "energy";
    this.energy.isLimited = true;
    this.energy.workerPerMine = new Decimal(100);

    this.computing = new Resource("f");
    this.computing.shape = "computing";

    this.shipyardProgress = new Resource("SP");
    this.shipyardProgress.shape = "cog";

    this.searchProgress = new Resource("XP");
    this.searchProgress.shape = "radar";
    //#endregion
    //#region Declarations

    //      Metal
    this.metalX1 = new Resource("m1");
    this.metalX1.unlocked = true;
    this.metalX1.quantity = new Decimal(1);
    this.metalX2 = new Resource("m2");
    this.metalX3 = new Resource("m3");
    this.metal.addGenerator(this.metalX1);
    this.energy.addGenerator(this.metalX1, -1);

    //      Crystal
    this.crystalX1 = new Resource("c1");
    this.crystalX1.unlocked = true;
    this.crystalX1.quantity = new Decimal(1);
    this.crystalX2 = new Resource("c2");
    this.crystalX3 = new Resource("c3");
    this.crystal.addGenerator(this.crystalX1);
    this.energy.addGenerator(this.crystalX1, -1);

    //      Alloy
    this.alloyX1 = new Resource("a1");
    this.alloyX2 = new Resource("a2");
    this.alloyX3 = new Resource("a3");
    this.alloy.addGenerator(this.alloyX1);
    this.energy.addGenerator(this.alloyX1, -1);
    this.alloyX1.productionMultiplier.additiveBonus.push(
      new Bonus(this.alloyX2, 0.1)
    );

    //      Energy
    this.energy.unlocked = true;
    this.energy.quantity = new Decimal(1);
    this.energyX1 = new Resource("e1");
    this.energyX2 = new Resource("e2");
    this.energyX3 = new Resource("e3");
    this.energyX1.unlocked = true;
    this.energyX1.quantity = new Decimal(3);
    this.energy.addGenerator(this.energyX1);

    //      Computing
    this.computingX1 = new Resource("f1");
    this.computingX2 = new Resource("f2");
    this.computingX3 = new Resource("f3");
    this.computing.addGenerator(this.computingX1);
    this.energy.addGenerator(this.computingX1, -2);

    //      Shipyard
    this.shipyardX1 = new Resource("S1");
    this.shipyardX2 = new Resource("S2");
    this.shipyardX3 = new Resource("S3");
    this.shipyardProgress.addGenerator(this.shipyardX1);
    this.alloy.addGenerator(this.shipyardX1, -1);
    this.energy.addGenerator(this.shipyardX1, -1);

    //      Search
    this.searchX1 = new Resource("X1");
    this.searchX2 = new Resource("X2");
    this.searchX3 = new Resource("X3");
    this.searchProgress.addGenerator(this.searchX1);
    this.energy.addGenerator(this.searchX1, -1);
    this.computing.addGenerator(this.searchX1, -1);

    //      Warrior
    this.warriorX1 = new Resource("W1");
    this.warriorX2 = new Resource("W2");
    this.warriorX3 = new Resource("W3");
    this.energy.addGenerator(this.warriorX1, -1);
    this.computing.addGenerator(this.warriorX1, -1);

    //      Space
    this.habitableSpace = new Resource("hs");
    this.habitableSpace.shape = "world";
    this.miningDistrict = new Resource("md");
    this.miningDistrict.shape = "miningD";
    this.crystalDistrict = new Resource("cd");
    this.crystalDistrict.shape = "crystalD";
    this.districts = [
      this.habitableSpace,
      this.miningDistrict,
      this.crystalDistrict
    ];
    this.districts.forEach(d => {
      d.unlocked = true;
      d.quantity = new Decimal(10);
    });
    //#endregion
    //#region Group
    this.materials = [
      this.metal,
      this.crystal,
      this.alloy,
      this.energy,
      this.computing,
      this.shipyardProgress,
      this.searchProgress
    ];
    this.tier1 = [
      this.metalX1,
      this.crystalX1,
      this.alloyX1,
      this.energyX1,
      this.computingX1,
      this.shipyardX1,
      this.searchX1,
      this.warriorX1
    ];
    this.tier2 = [
      this.metalX2,
      this.crystalX2,
      this.alloyX2,
      this.energyX2,
      this.computingX2,
      this.shipyardX2,
      this.searchX2,
      this.warriorX2
    ];
    this.tier3 = [
      this.metalX3,
      this.crystalX3,
      this.alloyX3,
      this.energyX3,
      this.computingX3,
      this.shipyardX3,
      this.searchX3,
      this.warriorX3
    ];
    //#endregion

    //#region Actions
    //#region Buy
    this.metalX1.generateBuyAction(
      new MultiPrice([new Price(this.metal, 100), new Price(this.crystal, 25)])
    );
    this.crystalX1.generateBuyAction(
      new MultiPrice([new Price(this.metal, 100), new Price(this.crystal, 50)])
    );
    this.metalX1.buyAction.afterBuy = this.unlockComputing.bind(this);
    this.crystalX1.buyAction.afterBuy = this.unlockComputing.bind(this);

    this.alloyX1.generateBuyAction(
      new MultiPrice([new Price(this.metal, 100), new Price(this.crystal, 100)])
    );
    this.energyX1.generateBuyAction(
      new MultiPrice([new Price(this.metal, 100), new Price(this.crystal, 100)])
    );
    this.computingX1.generateBuyAction(
      new MultiPrice([new Price(this.metal, 100), new Price(this.crystal, 200)])
    );
    this.shipyardX1.generateBuyAction(
      new MultiPrice([new Price(this.alloy, 100)])
    );
    this.searchX1.generateBuyAction(
      new MultiPrice([new Price(this.alloy, 100)])
    );
    this.warriorX1.generateBuyAction(
      new MultiPrice([new Price(this.alloy, 100)])
    );
    //#endregion
    //#region Mine
    //#region Tier 2 and 3
    for (let i = 0; i < this.tier2.length; i++) {
      const t1 = this.tier1[i];
      const t2 = this.tier2[i];

      const prices = new Array<Price>();
      let total = new Decimal(0);
      t1.buyAction.multiPrice.prices
        .filter(pr => pr.spendable !== this.habitableSpace)
        .forEach(pr => {
          const price = pr.cost.times(TIER_2_COST_MULTI);
          prices.push(new Price(pr.spendable, price));
          total = total.plus(price);
        });
      prices.push(new Price(this.alloy, total.times(TIER_2_ALLOY_PERCENT)));
      prices.push(new Price(this.habitableSpace, 1, 1));
      t2.generateBuyAction(new MultiPrice(prices));
    }
    for (let i = 0; i < this.tier2.length; i++) {
      const t2 = this.tier2[i];
      const t3 = this.tier3[i];

      const prices = new Array<Price>();
      let total = new Decimal(0);
      t2.buyAction.multiPrice.prices
        .filter(
          p => p.spendable !== this.alloy && p.spendable !== this.habitableSpace
        )
        .forEach(pr => {
          const price = pr.cost.times(TIER_3_COST_MULTI);
          prices.push(new Price(pr.spendable, price));
          total = total.plus(price);
        });
      prices.push(new Price(this.alloy, total.times(TIER_3_ALLOY_PERCENT)));
      prices.push(new Price(this.habitableSpace, 1, 1));
      t3.generateBuyAction(new MultiPrice(prices));
    }
    for (let i = 0; i < this.tier2.length; i++) {
      const t1 = this.tier1[i];
      const t2 = this.tier2[i];
      const t3 = this.tier3[i];

      //  Add Bonus
      // t1.productionMultiplier.additiveBonus.push(new Bonus(t2, 0.1));
      t1.efficiencyMultiplier.additiveBonus.push(new Bonus(t3, 0.1));

      t1.addGenerator(t2);
      t2.addGenerator(t3);

      this.energy.addGenerator(t2, -10);
      this.energy.addGenerator(t3, -100);

      const ba = t1.buyAction;
      if (ba) {
        ba.multiPrice.prices.forEach(p => {
          if (p.spendable instanceof Resource) {
            p.spendable.addGenerator(t2, p.cost.times(-1));
          }
        });
      }

      const ba2 = t2.buyAction;
      if (ba2) {
        ba2.multiPrice.prices.forEach(p => {
          if (p.spendable instanceof Resource) {
            p.spendable.addGenerator(t3, p.cost.times(-1));
          }
        });
      }
    }
    //#endregion
    //#region Mine
    //  Metal Mine
    const buyMetalMine = new Action(
      "L",
      new MultiPrice([
        new Price(this.metal, 1000),
        new Price(this.crystal, 250),
        new Price(this.miningDistrict, 1, 1)
      ])
    );
    buyMetalMine.afterBuy = () => {
      this.metalX1.reloadLimit();
    };
    buyMetalMine.name = "Metal Mine";
    this.metalX1.actions.push(buyMetalMine);
    this.metalX1.limitStorage = buyMetalMine;
    this.metalX1.prestigeLimit = AllSkillEffects.PLUS_METAL_MINER;

    //  Crystal Mine
    const buyCrystalMine = new Action(
      "L",
      new MultiPrice([
        new Price(this.metal, 1000),
        new Price(this.crystal, 500),
        new Price(this.crystalDistrict, 1, 1)
      ])
    );
    buyCrystalMine.afterBuy = () => {
      this.crystalX1.reloadLimit();
    };
    buyCrystalMine.name = "Crystal Mine";
    this.crystalX1.actions.push(buyCrystalMine);
    this.crystalX1.limitStorage = buyCrystalMine;
    this.crystalX1.prestigeLimit = AllSkillEffects.PLUS_CRYSTAL_MINER;

    //  Energy Battery
    const buyBattery = new Action(
      "P",
      new MultiPrice([
        new Price(this.metal, 1500),
        new Price(this.crystal, 1000)
      ])
    );
    buyBattery.afterBuy = () => {
      this.energy.reloadLimit();
    };
    buyBattery.name = "Batteries";
    this.energy.actions.push(buyBattery);
    this.energy.limitStorage = buyBattery;
    this.energy.prestigeLimit = AllSkillEffects.PLUS_BATTERY;
    this.energy.prestigeLimitIncrease = 100;

    //  Energy Plant
    const buyEnergyPlant = new Action(
      "L",
      new MultiPrice([
        new Price(this.metal, 1500),
        new Price(this.crystal, 1000),
        new Price(this.habitableSpace, 1, 1)
      ])
    );
    buyEnergyPlant.afterBuy = () => {
      this.energyX1.reloadLimit();
    };
    buyEnergyPlant.name = "Energy Plant";
    this.energyX1.actions.push(buyEnergyPlant);
    this.energyX1.limitStorage = buyEnergyPlant;
    this.energyX1.prestigeLimit = AllSkillEffects.PLUS_ENERGY;

    //  Supercomputer
    const buySuperComputer = new Action(
      "L",
      new MultiPrice([
        new Price(this.metal, 1500),
        new Price(this.crystal, 1000),
        new Price(this.habitableSpace, 1, 1)
      ])
    );
    buySuperComputer.afterBuy = () => {
      this.computingX1.reloadLimit();
    };
    buySuperComputer.name = "Super Computer";
    this.computingX1.actions.push(buySuperComputer);
    this.computingX1.limitStorage = buySuperComputer;
    this.computingX1.prestigeLimit = AllSkillEffects.PLUS_CPU;

    //  Alloy Foundry
    const buyFoundry = new Action(
      "L",
      new MultiPrice([
        new Price(this.metal, 1000),
        new Price(this.crystal, 1000),
        new Price(this.habitableSpace, 1, 1)
      ])
    );
    buyFoundry.afterBuy = () => {
      this.alloyX1.reloadLimit();
    };
    buyFoundry.name = "Alloy Foundry";
    this.alloyX1.actions.push(buyFoundry);
    this.alloyX1.limitStorage = buyFoundry;
    this.alloyX1.prestigeLimit = AllSkillEffects.PLUS_ALLOY;

    //  Shipyard
    const buyShipyard = new Action(
      "L",
      new MultiPrice([
        new Price(this.metal, 1000),
        new Price(this.crystal, 1000),
        new Price(this.habitableSpace, 1, 1)
      ])
    );
    buyShipyard.afterBuy = () => {
      this.shipyardX1.reloadLimit();
    };
    buyShipyard.name = "Shipyard";
    this.shipyardX1.actions.push(buyShipyard);
    this.shipyardX1.limitStorage = buyShipyard;
    this.shipyardX1.prestigeLimit = AllSkillEffects.PLUS_WORKER;

    this.shipyardProgress.reloadLimit = () => {
      const shipyard = Shipyard.getInstance();
      if (shipyard) {
        this.shipyardProgress.limit = shipyard.getTotalToDo();
        this.shipyardProgress.quantity = this.shipyardProgress.quantity.min(
          this.shipyardProgress.limit
        );
      }
      this.shipyardProgress.isCapped = this.shipyardProgress.limit.lt(0);
    };

    //  Searching
    const buyTelescope = new Action(
      "L",
      new MultiPrice([
        new Price(this.metal, 1000),
        new Price(this.crystal, 1000),
        new Price(this.habitableSpace, 1, 1)
      ])
    );
    buyTelescope.afterBuy = () => {
      this.searchX1.reloadLimit();
    };
    buyTelescope.name = "Telescope";
    this.searchX1.actions.push(buyTelescope);
    this.searchX1.limitStorage = buyTelescope;
    this.searchX1.prestigeLimit = AllSkillEffects.PLUS_SEARCH;

    this.searchProgress.reloadLimit = () => {
      const enemy = EnemyManager.getInstance();
      if (enemy) {
        this.searchProgress.limit = enemy.getTotalToDo();
        this.searchProgress.quantity = this.searchProgress.quantity.min(
          this.searchProgress.limit
        );
      }
      this.searchProgress.isCapped = this.searchProgress.limit.lt(0);
    };

    //  Warrior
    const buyStronghold = new Action(
      "L",
      new MultiPrice([
        new Price(this.metal, 1000),
        new Price(this.crystal, 1000),
        new Price(this.habitableSpace, 1, 1)
      ])
    );
    buyStronghold.afterBuy = () => {
      this.warriorX1.reloadLimit();
    };
    buyStronghold.name = "Stronghold";
    this.warriorX1.actions.push(buyStronghold);
    this.warriorX1.limitStorage = buyStronghold;
    this.warriorX1.prestigeLimit = AllSkillEffects.PLUS_WARRIOR;

    //#endregion
    //#region Arrays
    this.limited = [
      this.metalX1,
      this.crystalX1,
      this.alloyX1,
      this.energyX1,
      this.computingX1,
      this.energy,
      this.shipyardProgress,
      this.shipyardX1,
      this.searchX1,
      this.searchProgress,
      this.warriorX1
    ];

    this.limited.forEach(rl => {
      rl.isLimited = true;
      rl.reloadLimit();
    });

    this.allResources = [
      this.metal,
      this.crystal,
      this.alloy,
      this.energy,
      this.computing,
      this.metalX1,
      this.metalX2,
      this.metalX3,
      this.crystalX1,
      this.crystalX2,
      this.crystalX3,
      this.energyX1,
      this.energyX2,
      this.energyX3,
      this.alloyX1,
      this.alloyX2,
      this.alloyX3,
      this.computingX1,
      this.computingX2,
      this.computingX3,
      this.habitableSpace,
      this.miningDistrict,
      this.crystalDistrict,
      this.shipyardX1,
      this.shipyardX2,
      this.shipyardX3,
      this.shipyardProgress,
      this.searchX1,
      this.searchX2,
      this.searchX3,
      this.searchProgress,
      this.warriorX1,
      this.warriorX2,
      this.warriorX3
    ];
    this.allResources.forEach(r => r.generateRefundActions());
    // this.allResources.forEach(r => {
    //   r.unlocked = true;
    // });
    this.matGroup = new ResourceGroup("0", "Materials", "", this.materials);
    this.tierGroups = [
      this.matGroup,
      new ResourceGroup("1", "Tier 1", "", this.tier1),
      new ResourceGroup("2", "Tier 2", "", this.tier2),
      new ResourceGroup("3", "Tier 3", "", this.tier3),
      new ResourceGroup("4", "Districts", "", this.districts)
    ];

    this.reloadList();
    //#endregion
    //#region Info Messages
    this.metalX1.alerts = [
      {
        id: "1",
        getType: () => "info",
        getMessage: () => "Buy five or more to unlock new stuff",
        getCondition: () => ResourceManager.getInstance().metalX1.quantity.lt(5)
      }
    ];
    this.crystalX1.alerts = [
      {
        id: "2",
        getType: () => "info",
        getMessage: () => "Buy five or more to unlock new stuff",
        getCondition: () =>
          ResourceManager.getInstance().crystalX1.quantity.lt(5)
      }
    ];
    this.warriorX1.alerts = [
      {
        id: "3",
        getType: () => "info",
        getMessage: () =>
          ResourceManager.getInstance().warriorX1.name +
          " are granting + " +
          MainService.formatPipe.transform(
            FleetManager.getInstance().getNavalCapacityFromDrones(),
            true
          ) +
          " naval capacity",
        getCondition: () =>
          ResourceManager.getInstance().warriorX1.quantity.gte(1)
      }
    ];
    //#endregion
  }
  static getInstance() {
    return ResourceManager.instance;
  }
  /**
   *  Reload lists of unlocked resources
   */
  reloadList(): void {
    this.unlockedResources = this.allResources.filter(r => r.unlocked);
    this.unlockedProdResources = this.unlockedResources.filter(
      r => r.generators.length > 0 || r.products.length > 0
    );
    this.limitedResources = this.limited.filter(r => r.unlocked);
    this.tierGroups.forEach(tg => tg.reload());
    this.unlockedTierGroups = this.tierGroups.filter(
      u => u.unlockedResources.length > 0
    );
    this.matNav = this.materials.filter(
      m =>
        m.unlocked && m !== this.shipyardProgress && m !== this.searchProgress
    );
  }
  /**
   *  Calculate polynomial grow
   */
  loadPolynomial(): void {
    this.shipyardProgress.reloadLimit();
    this.searchProgress.reloadLimit();
    this.unlockedProdResources.forEach(res => {
      res.reloadProd();
    });
    this.energy.isCapped = false;

    for (const unit of this.unlockedProdResources) {
      unit.a = new Decimal(0);
      unit.b = new Decimal(0);
      unit.c = new Decimal(0);

      if (!unit.isCapped) {
        for (const prod1 of unit.generators.filter(p =>
          p.producer.isActive()
        )) {
          // x
          const prodX = prod1.prodPerSec;
          unit.c = unit.c.plus(prodX.times(prod1.producer.quantity));

          if (!prod1.producer.isCapped) {
            for (const prod2 of prod1.producer.generators.filter(p =>
              p.producer.isActive()
            )) {
              // x^2
              const prodX2 = prod2.prodPerSec.times(prodX);
              unit.b = unit.b.plus(prodX2.times(prod2.producer.quantity));

              if (!prod2.producer.isCapped) {
                for (const prod3 of prod2.producer.generators.filter(p =>
                  p.producer.isActive()
                )) {
                  // x^3
                  const prodX3 = prod3.prodPerSec.times(prodX2);
                  unit.a = unit.a.plus(prodX3.times(prod3.producer.quantity));
                }
              }
            }
          }
        }
      }
      unit.a = unit.a.div(6);
      unit.b = unit.b.div(2);
    }

    if (this.energy.quantity.gte(this.energy.limit)) {
      this.energy.isCapped = true;
    }
  }
  /**
   *  Calculate times to end
   */
  loadEndTime(): number {
    this.maxTime = Number.POSITIVE_INFINITY;
    this.unitZero = null;

    //  Reset
    this.unlockedProdResources.forEach(unit => {
      unit.endIn = Number.POSITIVE_INFINITY;
      unit.isEnding = false;
      unit.fullIn = Number.POSITIVE_INFINITY;
    });

    //  Load end times
    this.unlockedProdResources.forEach(unit => {
      const d = unit.quantity;
      if (unit.a.lt(0) || unit.b.lt(0) || unit.c.lt(0)) {
        const solution = solveEquation(unit.a, unit.b, unit.c, d).filter(s =>
          s.gte(0)
        );

        if (solution.length > 0) {
          const min = solution.reduce(
            (p, c) => p.min(c),
            new Decimal(Number.POSITIVE_INFINITY)
          );
          if (this.maxTime > min.toNumber() * 1000) {
            this.maxTime = min.toNumber() * 1000;
            this.unitZero = unit;
          }
          unit.endIn = Math.min(min.times(1000).toNumber(), unit.endIn);
          unit.isEnding = true;
        }
      }
    });

    //  Load full times
    this.limitedResources
      .filter(r => !r.isCapped && !r.isEnding)
      .forEach(unit => {
        const d = unit.quantity.minus(unit.limit);
        if (unit.a.gt(0) || unit.b.gt(0) || unit.c.gt(0)) {
          const solution = solveEquation(unit.a, unit.b, unit.c, d).filter(s =>
            s.gt(0)
          );

          if (solution.length > 0) {
            const min = solution.reduce(
              (p, c) => p.min(c),
              new Decimal(Number.POSITIVE_INFINITY)
            );
            if (this.maxTime > min.toNumber() * 1000) {
              this.maxTime = min.toNumber() * 1000;
              this.unitZero = unit;
            }
            unit.fullIn = Math.min(min.times(1000).toNumber(), unit.fullIn);
          }
        }
      });

    //  Fix Computing
    if (this.unitZero === this.computing && this.computing.c.gte(0)) {
      this.maxTime = Number.POSITIVE_INFINITY;
      this.computing.isEnding = false;
      this.unitZero = null;
    }
    return this.maxTime;
  }
  /**
   * Update resources
   *
   * @param  seconds in seconds
   */
  update(seconds: number): void {
    this.unlockedResources
      .filter(u => !u.a.eq(0) || !u.b.eq(0) || !u.c.eq(0))
      .forEach(u => {
        u.quantity = u.quantity
          .plus(u.a.times(Decimal.pow(seconds, 3)))
          .plus(u.b.times(Decimal.pow(seconds, 2)))
          .plus(u.c.times(seconds));
      });
    this.unlockedResources
      .filter(u => u.quantity.lt(0))
      .forEach(u => {
        u.quantity = new Decimal(0);
      });
    this.energy.quantity = this.energy.quantity.min(this.energy.limit);
  }
  /**
   * Stop consumers and producers of consumers of resource that have been ended
   */
  stopResource() {
    if (this.unitZero && this.unitZero.isEnding) {
      //  Stop consumers
      this.unitZero.generators
        .filter(p => p.producer.quantity.gt(0) && p.ratio.lt(0))
        .forEach(p => {
          p.producer.operativity = 0;
        });
      //  Stop consumers of producers
      this.unitZero.generators
        .filter(p => p.producer.quantity.gt(0) && p.ratio.gt(0))
        .forEach(p => {
          p.producer.generators
            .filter(p2 => p2.ratio.lt(0))
            .forEach(p2 => {
              p2.producer.operativity = 0;
            });
        });
      this.unitZero.isEnding = false;
    }
    if (this.unitZero && !this.unitZero.isEnding) {
      this.unitZero.isCapped = true;
    }
  }
  /**
   *  Reload prices and what player can buy
   */
  reloadActions() {
    this.unlockedResources.forEach(res => {
      res.actions.forEach(act => act.reload());
    });
  }

  /**
   *  Unlock computing if metalX1 and crystalX1 are >=5
   */
  unlockComputing() {
    if (
      !this.computing.unlocked &&
      this.metalX1.quantity.gte(5) &&
      this.crystalX1.quantity.gte(5)
    ) {
      this.computing.unlock();
      this.computingX1.unlock();
    }
  }
  //#region Save and load
  getSave(): any {
    const data: any = {};
    data.r = this.unlockedResources.map(r => r.getSave());
    return data;
  }
  load(data: any): boolean {
    if (!("r" in data && isArray(data.r))) return false;
    this.allResources.forEach(r => r.reset());

    for (const res of data.r) {
      const resource = this.allResources.find(u => u.id === res.i);
      if (resource) resource.load(res);
    }

    this.reloadList();
    this.limited.forEach(rl => {
      rl.reloadLimit();
    });
    return true;
  }
  //#endregion
}
