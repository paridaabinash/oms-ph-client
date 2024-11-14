import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportAddUpdateDlgComponent } from './report-add-update-dlg.component';

describe('ReportAddUpdateDlgComponent', () => {
  let component: ReportAddUpdateDlgComponent;
  let fixture: ComponentFixture<ReportAddUpdateDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportAddUpdateDlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportAddUpdateDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
