import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkingMasterComponent } from './linking-master.component';

describe('LinkingMasterComponent', () => {
  let component: LinkingMasterComponent;
  let fixture: ComponentFixture<LinkingMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LinkingMasterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinkingMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
