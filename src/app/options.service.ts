import { EventEmitter, Injectable } from "@angular/core";
declare let numberformat;

@Injectable({
  providedIn: "root"
})
export class OptionsService {
  static researchNotification = true;
  static warpNotification = true;
  static enemyDefeatedNotification = true;
  static researchModal = true;

  usaFormat = true;
  numFormat = "scientific";
  autosaveNotification = true;
  dark = true;
  header = 6;
  materialPosition = 1;
  showI = true;
  noResourceEndPopUp = false;
  timeFormatDetail = false;
  headerClass = "";
  autoSave = "5";

  formatter: any;
  formatEmitter: EventEmitter<number> = new EventEmitter<number>();
  headerEmitter: EventEmitter<number> = new EventEmitter<number>();
  formatId = 0;

  constructor() {
    this.reloadHeader();
    try {
      const n = 1.1;
      const separator = n.toLocaleString().substring(1, 2);
      if (separator === ",") this.usaFormat = false;
    } catch (ex) {}

    this.generateFormatter();
  }
  generateFormatter() {
    this.formatId++;
    try {
      this.formatter = new numberformat.Formatter({
        format: this.numFormat,
        flavor: "short"
      });
    } catch (ex) {
      console.log("Error generateFormatter:" + ex);
    }
    this.formatEmitter.emit(1);
  }
  reloadHeader() {
    this.headerClass = "header-" + this.header;
  }
  //#region Save and Load
  getSave(): any {
    return {
      u: this.usaFormat,
      n: this.numFormat,
      s: this.autosaveNotification,
      d: this.dark,
      h: this.header,
      m: this.materialPosition,
      i: this.showI,
      p: this.noResourceEndPopUp,
      w: OptionsService.warpNotification,
      t: this.timeFormatDetail,
      r: OptionsService.researchNotification,
      a: OptionsService.enemyDefeatedNotification,
      q: OptionsService.researchModal
    };
  }
  restore(data: any) {
    if ("u" in data) this.usaFormat = data.u;
    if ("n" in data) this.numFormat = data.n;
    if ("s" in data) this.autosaveNotification = data.s;
    if ("d" in data) this.dark = data.d;
    if ("h" in data) this.header = data.h;
    if ("m" in data) this.materialPosition = data.m;
    if ("i" in data) this.showI = data.i;
    if ("p" in data) this.noResourceEndPopUp = data.p;
    if ("w" in data) OptionsService.warpNotification = data.w;
    if ("t" in data) this.timeFormatDetail = data.t;
    if ("r" in data) OptionsService.researchNotification = data.r;
    if ("a" in data) OptionsService.enemyDefeatedNotification = data.a;
    if ("q" in data) OptionsService.researchModal = data.q;
    this.generateFormatter();
    this.reloadHeader();
  }
  //#endregion
}
