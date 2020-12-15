import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDriverComponent } from './profile-driver.component';

describe('ProfileDriverComponent', () => {
  let component: ProfileDriverComponent;
  let fixture: ComponentFixture<ProfileDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileDriverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
