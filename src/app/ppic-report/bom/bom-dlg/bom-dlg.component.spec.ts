import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BomDlgComponent } from './bom-dlg.component';

describe('BomDlgComponent', () => {
  let component: BomDlgComponent;
  let fixture: ComponentFixture<BomDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BomDlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BomDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
