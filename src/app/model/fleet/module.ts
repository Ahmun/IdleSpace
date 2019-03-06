import { AbstractUnlockable } from "../base/AbstractUnlockable";
import { Research } from "../research/research";

export enum Sizes {
  Small = 1,
  Medium,
  Large,
  ExtraLarge
}
export const ALL_SIZES = [
  Sizes.Small,
  Sizes.Medium,
  Sizes.Large,
  Sizes.ExtraLarge
];
const sizeNames = [
  ["S", "Small"],
  ["M", "Medium"],
  ["L", "Large"],
  ["XL", "ExtraLarge"]
];
export function getSizeName(size: Sizes, short = false): string {
  return sizeNames[size - 1][short ? 0 : 1];
}
export interface IModuleData {
  id: string;
  name: string;
  sizes: Sizes[];
  alloyPrice: DecimalSource;
  energyBalance?: DecimalSource;
  damage?: DecimalSource;
  armorPercent?: number;
  shieldPercent?: number;
  shield?: DecimalSource;
  armor?: DecimalSource;
}
export class Module extends AbstractUnlockable {
  research: Research;

  constructor(
    id: string,
    name: string,
    public sizes: Sizes[] = [Sizes.Small],
    public alloyPrice: Decimal = new Decimal(0),
    public energyBalance: Decimal = new Decimal(0),
    public damage: Decimal = new Decimal(0),
    public armorPercent = 100,
    public shieldPercent = 100,
    public shield: Decimal = new Decimal(0),
    public armor: Decimal = new Decimal(0)
  ) {
    super();

    this.id = id;
    this.name = name;
  }

  static fromData(data: IModuleData): Module {
    const ret = new Module(data.id, data.name, data.sizes);
    if (data.alloyPrice) ret.alloyPrice = new Decimal(data.alloyPrice);
    if (data.energyBalance) ret.energyBalance = new Decimal(data.energyBalance);
    if (data.damage) ret.damage = new Decimal(data.damage);
    if (data.shield) ret.shield = new Decimal(data.shield);
    if (data.armor) ret.armor = new Decimal(data.armor);
    if (data.armorPercent) ret.armorPercent = data.armorPercent;
    if (data.shieldPercent) ret.shieldPercent = data.shieldPercent;
    return ret;
  }

  reload() {
    this.unlocked = !this.research || this.research.done;
  }
}
