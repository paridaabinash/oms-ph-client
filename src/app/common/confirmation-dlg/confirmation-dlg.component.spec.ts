import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationDlgComponent } from './confirmation-dlg.component';

describe('ConfirmationDlgComponent', () => {
  let component: ConfirmationDlgComponent;
  let fixture: ComponentFixture<ConfirmationDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmationDlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmationDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
