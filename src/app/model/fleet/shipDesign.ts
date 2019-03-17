import { ShipType, ShipTypes } from "./shipTypes";
import { ISalvable } from "../base/ISalvable";
import { DesignLine } from "./designLine";
import { Action } from "../actions/abstractAction";
import { IBuyable } from "../base/IBuyable";
import { BuyAction } from "../actions/buyAction";
import { MultiPrice } from "../prices/multiPrice";
import { Price } from "../prices/price";
import { ResourceManager } from "../resource/resourceManager";
import { FleetManager } from "./fleetManager";
import { Preset } from "../enemy/preset";
import sample from "lodash-es/sample";
import { Sizes } from "./module";
import { ShipData } from "src/app/workers/battleRequest";

const MODULE_PRICE_INCREASE = 1.1;
export const SIZE_MULTI = 0.1;

export class ShipDesign implements ISalvable, IBuyable {
  id: string;
  type: ShipType;
  name = "";
  shipQuantity = new Decimal(0);

  modules = new Array<DesignLine>();

  totalDamage: Decimal;
  totalArmor: Decimal;
  totalShield: Decimal;
  totalEnergy: Decimal;
  armorDamage: Decimal;
  shieldDamage: Decimal;
  price: Decimal;
  totalFleetPower: Decimal;

  editable: ShipDesign;
  original: ShipDesign;
  usedModulePoint = 0;
  isValid = true;

  buyAction: Action;
  actions = new Array<Action>();
  quantity = new Decimal();
  isLimited = false;
  limit = new Decimal();
  isCapped = false;
  upgradePrice = new Decimal();
  weight = 1;

  static fromPreset(preset: Preset): ShipDesign {
    const shipDesign = new ShipDesign();
    shipDesign.name = preset.name;
    shipDesign.type = preset.type;
    shipDesign.modules = preset.modules.map(dm => {
      const chosen = sample(dm.id);
      return new DesignLine(
        FleetManager.getInstance().allModules.find(m => m.id === chosen),
        dm.size
      );
    });
    shipDesign.reload();

    //  Complete with armor
    const availableModules =
      shipDesign.modules.length - shipDesign.type.moduleCount;
    const availableModulePoints =
      shipDesign.usedModulePoint - shipDesign.type.modulePoint;

    if (availableModulePoints > 0) {
      let armor = shipDesign.modules.find(
        m => m.module.id === FleetManager.getInstance().armor.id
      );
      if (!armor && availableModules > 1) {
        armor = new DesignLine(FleetManager.getInstance().armor);
        shipDesign.modules.push(armor);
      }
      if (armor) {
        armor.size = armor.size + availableModulePoints;
      }
      armor.size = Math.min(armor.size, Sizes.ExtraLarge);
    }

    shipDesign.reload();
    return shipDesign;
  }

  static GetTotalNavalCap(ships: ShipDesign[]): Decimal {
    return ships
      .map(s => s.quantity.times(s.type.navalCapacity))
      .reduce((p, c) => p.plus(c), new Decimal(0));
  }

  reload(isPlayer = true) {
    this.totalDamage = new Decimal(0);
    this.totalShield = new Decimal(0);
    this.totalEnergy = new Decimal(0);
    this.armorDamage = new Decimal(0);
    this.shieldDamage = new Decimal(0);
    this.totalFleetPower = new Decimal(0);
    this.totalArmor = new Decimal(this.type ? this.type.health : 0);
    this.usedModulePoint = 0;
    this.price = new Decimal(this.type.baseCost);

    this.modules
      .filter(q => q.isValid())
      .forEach(w => {
        const multiPrice = w.level * Math.pow(MODULE_PRICE_INCREASE, w.level);
        const bonus = w.level;
        const sizeFactor = w.size + (w.size - 1) * SIZE_MULTI;
        this.usedModulePoint += w.size;

        w.computedDamage = w.module.damage.times(bonus).times(sizeFactor);
        this.totalDamage = this.totalDamage.plus(w.computedDamage);
        this.totalEnergy = this.totalEnergy.plus(
          w.module.energyBalance.times(bonus).times(w.size)
        );
        this.totalArmor = this.totalArmor.plus(
          w.module.armor.times(bonus).times(sizeFactor)
        );
        this.totalShield = this.totalShield.plus(
          w.module.shield.times(bonus).times(sizeFactor)
        );

        this.armorDamage = this.armorDamage.plus(
          w.module.damage
            .times(bonus)
            .times(sizeFactor)
            .times(w.module.armorPercent / 100)
        );
        this.shieldDamage = this.shieldDamage.plus(
          w.module.damage
            .times(bonus)
            .times(sizeFactor)
            .times(w.module.shieldPercent / 100)
        );
        this.price = this.price.plus(
          w.module.alloyPrice.times(w.size).times(multiPrice)
        );
      });

    this.totalFleetPower = this.totalDamage
      .plus(this.totalShield)
      .plus(this.totalArmor);

    this.isValid =
      this.totalEnergy.gte(0) &&
      this.usedModulePoint <= this.type.modulePoint &&
      this.modules.length <= this.type.moduleCount;

    this.upgradePrice = this.original
      ? this.price
          .minus(this.original.price)
          .max(0)
          .times(this.original.quantity)
      : new Decimal();

    if (isPlayer) this.generateBuyAction();
  }
  getSave(): any {
    const data: any = {};
    data.i = this.id;
    if (!this.shipQuantity.eq(0)) data.q = this.shipQuantity;
    data.t = this.type.id;
    data.n = this.name;
    data.m = this.modules.map(m => m.getSave());
    if (this.quantity.gt(0)) data.q = this.quantity;

    return data;
  }
  load(data: any, isPlayer = true): boolean {
    this.id = data.i;
    if ("q" in data) this.shipQuantity = Decimal.fromDecimal(data.q);
    this.type = ShipTypes.find(t => t.id === data.t);
    this.name = data.n;
    if ("m" in data) {
      for (const modData of data.m) {
        this.modules.push(DesignLine.CreateFromData(modData));
      }
    }
    if ("q" in data) {
      this.quantity = Decimal.fromDecimal(data.q);
    }

    this.reload(isPlayer);
    return true;
  }
  copy() {
    this.editable = new ShipDesign();
    this.editable.original = this;
    this.editable.name = this.name;
    this.editable.id = this.id;
    this.editable.type = this.type;
    this.editable.shipQuantity = new Decimal(this.shipQuantity);
    this.modules.forEach(w => {
      this.editable.modules.push(DesignLine.copy(w));
    });

    this.editable.reload();
  }
  getCopy(): ShipDesign {
    const ret = new ShipDesign();
    ret.id = this.id;
    ret.type = this.type;
    ret.name = this.name;
    ret.modules = this.modules;
    ret.reload(false);
    return ret;
  }
  addModule() {
    this.editable.modules.push(new DesignLine());
    this.editable.reload();
  }
  removeModule(i: number) {
    this.editable.modules.splice(i, 1);
    this.editable.reload();
  }

  saveConfig() {
    const resMan = ResourceManager.getInstance();

    if (
      this.editable &&
      this.editable.isValid &&
      resMan.alloy.quantity.gte(this.editable.upgradePrice)
    ) {
      resMan.alloy.quantity = resMan.alloy.quantity.minus(
        this.editable.upgradePrice
      );
      this.name = this.editable.name;
      this.modules = this.editable.modules;
      this.reload();
    }
  }
  generateBuyAction() {
    this.buyAction = new BuyAction(
      this,
      new MultiPrice([
        new Price(ResourceManager.getInstance().alloy, this.price, 1),
        new Price(
          FleetManager.getInstance().freeNavalCapacity,
          this.type.navalCapacity,
          1
        )
      ])
    );
    this.buyAction.showNum = false;
    this.buyAction.reload();
  }
  getShipData(): ShipData {
    const shipData = new ShipData();
    shipData.id = this.id;
    shipData.quantity = this.quantity;
    shipData.totalArmor = this.totalArmor;
    shipData.totalShield = this.totalShield;
    shipData.modules = new Array<{
      computedDamage: Decimal
      shieldPercent: number
      armorPercent: number
    }>();

    this.modules.forEach(m => {
      const weapon = {
        computedDamage: m.computedDamage,
        shieldPercent: m.module.shieldPercent,
        armorPercent: m.module.armorPercent
      };
      shipData.modules.push(weapon);
    });
    return shipData;
  }
}
