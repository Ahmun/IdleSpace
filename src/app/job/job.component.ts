import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  HostBinding,
  ChangeDetectorRef,
  OnDestroy
} from "@angular/core";
import { IJob } from "../model/base/IJob";
import { Subscription } from "rxjs";
import { MainService } from "../main.service";

@Component({
  selector: "app-job",
  templateUrl: "./job.component.html",
  styleUrls: ["./job.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobComponent implements OnInit, OnDestroy {
  @HostBinding("class")
  card = "card drag-item";

  @Input() job: IJob;

  private subscriptions: Subscription[] = [];

  constructor(public ms: MainService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.subscriptions.push(
      this.ms.em.updateEmitter.subscribe(() => {
        this.cd.markForCheck();
      })
    );
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
  delete() {
    if (this.job.deleteFun) this.job.deleteFun();
  }
}
