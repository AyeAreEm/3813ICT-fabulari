import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupSettingsComponent } from './group-settings';

describe('GroupSettingsComponent', () => {
  let component: GroupSettingsComponent;
  let fixture: ComponentFixture<GroupSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupSettingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
