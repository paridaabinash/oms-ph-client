import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpicReportComponent } from './ppic-report.component';

describe('PpicReportComponent', () => {
  let component: PpicReportComponent;
  let fixture: ComponentFixture<PpicReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PpicReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PpicReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
