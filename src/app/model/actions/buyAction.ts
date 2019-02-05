import { AbstractAction } from "./abstractAction";
import { MultiPrice } from "../prices/multiPrice";
import { Resource } from "../resource/resource";

export class BuyAction extends AbstractAction {
  constructor(public buyable: Resource, multiPrice: MultiPrice) {
    super("B", multiPrice);
    this.name = "Buy";
    this.showTime = true;
  }

  buy(number: Decimal) {
    if (this.buyable.isLimited) {
      if (this.buyable.isCapped) return false;
      number = Decimal.min(
        number,
        this.buyable.limit.minus(this.buyable.quantity)
      );
    }

    super.buy(number);
  }

  onBuy(number: Decimal): boolean {
    this.buyable.quantity = this.buyable.quantity.plus(number);
    if (this.buyable.isLimited) {
      this.buyable.isCapped = this.buyable.quantity.gte(this.buyable.limit);
    }

    return true;
  }

  reload() {
    if (this.buyable.isCapped) {
      super.reload();
      this.canBuy = false;
      this.canBuyWanted = false;
      this.availableIn = Number.POSITIVE_INFINITY;
      this.maxBuy = new Decimal(0);
      return;
    }

    if (this.buyable.isLimited) {
      const max = this.buyable.limit.minus(this.buyable.quantity);
      this.numWanted = this.numWanted.min(max);
      super.reload();
      this.maxBuy = this.maxBuy.min(max);
      return;
    }

    super.reload();
  }
  isCapped(): boolean {
    return this.buyable.isCapped;
  }
}
