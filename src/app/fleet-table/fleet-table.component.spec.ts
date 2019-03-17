import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FleetTableComponent } from "./fleet-table.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ClarityModule } from "@clr/angular";
import { RouterTestingModule } from "@angular/router/testing";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormatPipe } from "../format.pipe";
import { EndInPipe } from "../end-in.pipe";
import { MainService } from "../main.service";
import { OptionsService } from "../options.service";
import { ShipDesign } from "../model/fleet/shipDesign";
import { SizesPipe } from "../sizes.pipe";
import { SizeNamePipe } from "../size-name.pipe";

describe("FleetTableComponent", () => {
  let component: FleetTableComponent;
  let fixture: ComponentFixture<FleetTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        ClarityModule,
        RouterTestingModule,
        FormsModule,
        BrowserAnimationsModule
      ],
      declarations: [FleetTableComponent, FormatPipe, EndInPipe, SizeNamePipe],
      providers: [MainService, OptionsService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetTableComponent);
    component = fixture.componentInstance;
    component.fleet = new Array<ShipDesign>();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
