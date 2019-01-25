import { ISpendable } from "./ISpendable";

export class Multiplier {
  constructor(public base: ISpendable, public multi: Decimal) {}
  getBonus(asPercent = false): Decimal {
    let bonus = this.base.quantity.times(this.multi);
    if (asPercent) {
      bonus = bonus.times(100);
    }
    return bonus;
  }
}
