    
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoFaqComponent } from './info-faq.component';

describe('InfoModComponent', () => {
  let component: InfoFaqComponent;
  let fixture: ComponentFixture<InfoFaqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoFaqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
