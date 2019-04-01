import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { JobComponent } from "./job.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ClarityModule } from "@clr/angular";
import { RouterTestingModule } from "@angular/router/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ActionHeaderComponent } from "../action/action-header/action-header.component";
import { FormatPipe } from "../format.pipe";
import { MainService } from "../main.service";
import { OptionsService } from "../options.service";
import { Job } from "../model/shipyard/job";
import { ShipDesign } from "../model/fleet/shipDesign";
import { ShipTypes } from "../model/fleet/shipTypes";

describe("JobComponent", () => {
  let component: JobComponent;
  let fixture: ComponentFixture<JobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ClarityModule, RouterTestingModule, BrowserAnimationsModule],
      declarations: [JobComponent, ActionHeaderComponent, FormatPipe],
      providers: [MainService, OptionsService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobComponent);
    component = fixture.componentInstance;
    const job = new Job();
    job.design = new ShipDesign();
    job.design.type = ShipTypes[0];
    job.quantity = new Decimal(1);
    component.job = job;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
