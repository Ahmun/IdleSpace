import { IResearchData } from "./iResearchData";

export const ResearchData: IResearchData[] = [
  //  Unlocked by default
  {
    id: "r",
    name: "Better Researching",
    shape: "flask",
    price: 200,
    description: "+20% researching speed",
    limit: Number.POSITIVE_INFINITY,
    researchToUnlock: ["c", "E"]
  },
  //    End of starting researches  ---------------
  {
    id: "E",
    name: "Energy",
    shape: "energy",
    price: 1e3,
    description: "+10% energy",
    limit: Number.POSITIVE_INFINITY
  },
  {
    id: "c",
    name: "Corvette",
    shape: "rank1",
    price: 2e3,
    description: "Unlock Corvette",
    resourceToUnlock: ["S1", "SP", "a", "a1"],
    researchToUnlock: ["SC", "f", "X1", "W1", "mM", "cM", "eM"]
  },
  {
    id: "SC",
    name: "Scavenger",
    shape: "coin-bag",
    price: 5e3,
    description: "+10% resources from battle",
    limit: Number.POSITIVE_INFINITY
  },
  {
    id: "W1",
    name: "Warriors",
    shape: "bullseye",
    price: 1e5,
    description: "Unlock Warriors",
    resourceToUnlock: ["W1", "n"]
  },
  {
    id: "X1",
    name: "Telescope",
    shape: "radar",
    price: 1e4,
    description: "Unlock Telescope",
    resourceToUnlock: ["X1", "XP"],
    researchToUnlock: ["D"]
  },
  {
    id: "f",
    name: "Frigate",
    shape: "rank2",
    price: 1e6,
    description: "Unlock frigate",
    researchToUnlock: ["d"]
  },
  {
    id: "d",
    name: "Destroyer",
    shape: "rank3",
    price: 1e8,
    description: "Unlock destroyer",
    researchToUnlock: ["b"]
  },
  {
    id: "b",
    name: "Cruiser",
    shape: "rank4",
    price: 1e11,
    description: "Unlock cruiser",
    researchToUnlock: ["t"]
  },
  {
    id: "t",
    name: "Battlecruiser",
    shape: "flask",
    price: 1e14,
    description: "Unlock battlecruiser",
    researchToUnlock: ["s"]
  },
  {
    id: "s",
    name: "Battleship",
    shape: "flask",
    price: 1e19,
    description: "Unlock battleship"
  },
  {
    id: "D",
    name: "Drone Factory",
    shape: "battery",
    price: 1e5,
    description: "Drone Factory",
    resourceToUnlock: ["D", "F"],
    researchToUnlock: ["M"]
  },
  {
    id: "M",
    name: "Drone Modding",
    shape: "battery",
    price: 2e5,
    description: "+1 drone modding point",
    limit: Number.POSITIVE_INFINITY
  },

  {
    id: "mM",
    name: "Mineral purification plant",
    shape: "metal",
    price: 5e4,
    description: "unlock Mineral purification plant",
    resourceToUnlock: ["mM"]
  },
  {
    id: "cM",
    name: "Crystal purification plant",
    shape: "crystal",
    price: 5e4,
    description: "unlock Crystal purification plant",
    resourceToUnlock: ["cM"]
  },
  {
    id: "eM",
    name: "Electrical grid",
    shape: "energy",
    price: 5e4,
    description: "unlock Electrical grid",
    resourceToUnlock: ["eM"]
  }
];
