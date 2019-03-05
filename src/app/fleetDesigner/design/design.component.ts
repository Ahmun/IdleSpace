import {
  Component,
  OnInit,
  HostBinding,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from "@angular/core";
import { Subscription } from "rxjs";
import { MainService } from "src/app/main.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ShipDesign } from "src/app/model/fleet/shipDesign";
import { ShipTypes, ShipType } from "src/app/model/fleet/shipTypes";
import { ResearchManager } from "src/app/model/research/researchManager";

@Component({
  selector: "app-design",
  templateUrl: "./design.component.html",
  styleUrls: ["./design.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesignComponent implements OnInit, OnDestroy {
  @HostBinding("class")
  contentArea = "content-area";
  design: ShipDesign;

  name = "";
  id = "";
  type = "1";

  unlockedShips: ShipType[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    public ms: MainService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.unlockedShips = [];
    if (ResearchManager.getInstance().corvette.done) {
      this.unlockedShips.push(ShipTypes[0]);
    }
    if (ResearchManager.getInstance().frigate.done) {
      this.unlockedShips.push(ShipTypes[1]);
    }
    if (ResearchManager.getInstance().destroyer.done) {
      this.unlockedShips.push(ShipTypes[2]);
    }
    if (ResearchManager.getInstance().cruiser.done) {
      this.unlockedShips.push(ShipTypes[3]);
    }
    if (ResearchManager.getInstance().battlecruiser.done) {
      this.unlockedShips.push(ShipTypes[4]);
    }
    if (ResearchManager.getInstance().battleship.done) {
      this.unlockedShips.push(ShipTypes[5]);
    }

    this.type = "1";
    this.subscriptions.push(
      this.route.params.subscribe(this.getDesign.bind(this))
    );
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  generate() {
    if (this.isDisabled()) return false;

    const shipType = ShipTypes.find(t => t.id === this.type);
    const design = this.ms.game.fleetManager.addDesign(this.name, shipType);

    this.router.navigate(["/fleet/design/" + design.id]);
  }

  getDesign(params: any) {
    this.design = null;

    let id = params.id;
    if (id === undefined) {
      id = "";
    }
    const b = this.ms.game.fleetManager.ships.find(u => u.id === id);
    if (b) this.design = b;

    this.cd.markForCheck();
  }

  typeId(index: number, shipType: ShipType) {
    return shipType.id;
  }
  isDisabled(): boolean {
    return !(this.name.trim() !== "" && this.type.length > 0);
  }
}
