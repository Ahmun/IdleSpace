import { Injectable, Inject } from "@angular/core";
import { createWorker, ITypedWorker } from "typed-web-workers";
import { Game } from "./model/game";
import { Emitters } from "./emitters";
import { DOCUMENT } from "@angular/common";
import { OptionsService } from "./options.service";
import { BattleService } from "./battle.service";
import { FormatPipe } from "./format.pipe";
import { ToastrService } from "ngx-toastr";
import { EndInPipe } from "./end-in.pipe";

declare let LZString: any;

const UP_INTERVAL = 200; // 5 fps
const SAVE_INTERVAL_1 = 1 * 60 * 1000;
const SAVE_INTERVAL_3 = 3 * 60 * 1000;
const SAVE_INTERVAL_5 = 5 * 60 * 1000;

export function getUrl() {
  return (
    document.location.protocol +
    "//" +
    document.location.host +
    (document.location.pathname === "/context.html"
      ? "/"
      : document.location.pathname)
  );
}
@Injectable({
  providedIn: "root"
})
export class MainService {
  static formatPipe: FormatPipe;
  static endInPipe: EndInPipe;
  static toastr: ToastrService;

  zipWorker: ITypedWorker<CompressRequest, CompressRequest2>;
  game: Game;
  show = false;
  lastUnitUrl = "/home/res/m";
  last: number;
  em = Emitters.getInstance();
  kongregate = false;
  playFabLogged = false;
  theme: HTMLLinkElement;
  overviewTaActive = false;
  lastSave = null;
  autoSaveInterval = -1;

  constructor(
    public options: OptionsService,
    public battleService: BattleService,
    @Inject(DOCUMENT) private document: Document,
    public toastr: ToastrService
  ) {
    MainService.toastr = this.toastr;
    this.battleService.em = this.em;
    this.theme = this.document.createElement("link");
    this.theme.rel = "stylesheet";
    this.theme.type = "text/css";
    this.document
      .querySelector("head")
      .insertBefore(
        this.theme,
        document
          .getElementsByTagName("head")[0]
          .getElementsByTagName("style")[0]
      );

    const url = getUrl();
    this.zipWorker = createWorker({
      workerFunction: this.comp,
      onMessage: this.onZip.bind(this),
      onError: error => {},
      importScripts: [
        url + "lz-string.min.js",
        url + "assets/compressRequest2.js"
      ]
    });

    MainService.formatPipe = new FormatPipe(this.options);
    MainService.endInPipe = new EndInPipe(this.options);
  }
  start() {
    const savedData = localStorage.getItem("save");
    if (savedData) {
      this.load(savedData);
      this.setTheme();
    } else {
      this.setTheme();
      this.game = new Game();
    }

    setInterval(this.update.bind(this), UP_INTERVAL);
    setTimeout(() => this.startAutoSave.bind(this), 1000 * 60);

    setTimeout(() => {
      if (!this.game) {
        this.setTheme();
        this.game = new Game();
      }
    }, 5 * 1000);

    this.show = true;
  }

  update() {
    if (!this.game) return false;

    const now = Date.now();
    const diff = (now - this.last) / 1000;
    // diff = diff * 1000;
    this.game.update(diff);
    this.last = now;
    this.em.updateEmitter.emit(diff);
  }
  reload() {
    this.game.reload();
    this.em.updateEmitter.emit(0);
  }
  getSave(): any {
    const data: any = {};
    data.g = this.game.save();
    data.o = this.options.getSave();
    data.l = this.last;
    return data;
  }
  load(data?: any): any {
    this.zipWorker.postMessage(
      new CompressRequest(localStorage.getItem("save"), "", false, 2)
    );
  }
  load2(data: any): any {
    if (data && data.g) {
      this.last = data.l;
      this.lastSave = data.l;
      if ("o" in data) this.options.restore(data.o);
      this.setTheme();
      this.game = new Game();
      this.game.load(data.g);
      this.show = true;
      this.toastr.info(
        "You were offline for " +
          MainService.endInPipe.transform(Date.now() - this.last),
        "Game Loaded"
      );
      this.startAutoSave();
    } else {
      this.toastr.error("See console", "Load Failed");
      console.log(data);
    }
    if (!this.game) {
      this.setTheme();
      this.game = new Game();
    }
  }
  import(str: string) {
    this.zipWorker.postMessage(new CompressRequest(str, "", false, 2));
  }

  export() {
    this.zipWorker.postMessage(new CompressRequest(this.getSave(), "", true, 1));
  }
  save(auto = false) {
    if (!this.game) return false;

    this.zipWorker.postMessage(
      new CompressRequest(this.getSave(), "", true, auto ? 10 : 0)
    );
  }
  clear() {
    localStorage.removeItem("save");
    window.location.reload();
  }

  comp(input: CompressRequest, cb: (_: CompressRequest2) => void): void {
    if (input.compress) {
      let save = "";
      try {
        save = LZString.compressToBase64(JSON.stringify(input.obj));
      } catch (ex) {
        save = "";
      }
      cb(new CompressRequest2(null, save, input.compress, input.requestId));
    } else {
      let obj: any = null;
      try {
        obj = JSON.parse(LZString.decompressFromBase64(input.obj));
      } catch (ex) {
        obj = "";
      }
      cb(new CompressRequest2(obj, null, input.compress, input.requestId));
    }
  }

  onZip(result: CompressRequest2): void {
    if (result.compress) {
      if (result.zipped !== "") {
        if (result.requestId === 0 || result.requestId === 10) {
          localStorage.setItem("save", result.zipped);
          localStorage.setItem("saveDate", Date());
          this.lastSave = Date();
          if (result.requestId === 0 || this.options.autosaveNotification) {
            this.toastr.success("Game Saved");
          }
        } else if (result.requestId === 1) {
          this.em.zipEmitter.emit(result.zipped);
        }
        // console.log(result);
      } else {
        console.log("Error");
        this.toastr.error("Game not Saved");
      }
    } else {
      if (result.obj != null) {
        this.load2(result.obj);
      } else {
        console.log("Error");
        this.toastr.error("Game not Saved");
      }
    }
    this.em.saveEmitter.emit("s");
  }

  playFabLogin() {
    // ToDo
  }
  loadPlayFab() {
    //  ToDo
  }
  savePlayFab() {
    //  ToDo
  }

  setTheme() {
    const myTheme =
      "assets/" + (this.options.dark ? "theme.dark.css" : "theme.light.css");
    if (myTheme !== this.theme.href) this.theme.href = myTheme;
  }
  startAutoSave() {
    if (this.autoSaveInterval > -1) {
      clearInterval(this.autoSaveInterval);
    }

    let interval = 5;
    switch (this.options.autoSave) {
      case "1":
        interval = SAVE_INTERVAL_1;
        break;
      case "3":
        interval = SAVE_INTERVAL_3;
        break;
      case "5":
        interval = SAVE_INTERVAL_5;
        break;
      case "off":
        interval = -1;
        break;
    }
    if (interval > 0) {
      console.log(interval);
      this.autoSaveInterval = window.setInterval(
        this.save.bind(this, true),
        interval
      );
    }
  }
}

// tslint:disable-next-line:max-classes-per-file
class CompressRequest {
  constructor(
    public obj: any,
    public zipped: string,
    public compress: boolean,
    public requestId: number
  ) {}
}
