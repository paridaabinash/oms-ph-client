import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterDlgComponent } from './master-dlg.component';

describe('MasterDlgComponent', () => {
  let component: MasterDlgComponent;
  let fixture: ComponentFixture<MasterDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MasterDlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MasterDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
