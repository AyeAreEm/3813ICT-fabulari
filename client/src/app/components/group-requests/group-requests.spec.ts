import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupRequests } from './group-requests';

describe('GroupRequests', () => {
  let component: GroupRequests;
  let fixture: ComponentFixture<GroupRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
