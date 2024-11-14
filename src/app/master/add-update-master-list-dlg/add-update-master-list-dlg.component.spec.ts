import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateMasterListDlgComponent } from './add-update-master-list-dlg.component';

describe('AddUpdateMasterListDlgComponent', () => {
  let component: AddUpdateMasterListDlgComponent;
  let fixture: ComponentFixture<AddUpdateMasterListDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddUpdateMasterListDlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUpdateMasterListDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
