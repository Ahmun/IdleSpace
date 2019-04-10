import { BASE_ARMOR } from "./moduleData";

export class ShipType {
  constructor(
    public id: string,
    public name: string,
    public baseCost: Decimal,
    public health: Decimal,
    public moduleCount: number,
    public modulePoint: number,
    public shape: string,
    public navalCapacity: number
  ) {}
}
export const ShipTypes = [
  new ShipType(
    "1",
    "Corvette",
    new Decimal(10),
    new Decimal(BASE_ARMOR),
    4,
    4,
    "rank1",
    1
  ),
  new ShipType(
    "2",
    "Frigate",
    new Decimal(20),
    new Decimal(BASE_ARMOR * 2.25),
    5,
    6,
    "rank2",
    2
  ),
  new ShipType(
    "3",
    "Destroyer",
    new Decimal(40),
    new Decimal(BASE_ARMOR * 3.5),
    6,
    8,
    "rank3",
    4
  ),
  new ShipType(
    "4",
    "Cruiser",
    new Decimal(80),
    new Decimal(BASE_ARMOR * 4.75),
    7,
    10,
    "rank4",
    8
  ),
  new ShipType(
    "5",
    "Battlecruiser",
    new Decimal(160),
    new Decimal(BASE_ARMOR * 6),
    8,
    12,
    "rank4",
    16
  ),
  new ShipType(
    "6",
    "Battleship",
    new Decimal(320),
    new Decimal(BASE_ARMOR * 7.25),
    9,
    14,
    "rank4",
    32
  )
];
