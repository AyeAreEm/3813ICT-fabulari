import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupRequestsComponent } from './group-requests';

describe('GroupRequestsComponent', () => {
  let component: GroupRequestsComponent;
  let fixture: ComponentFixture<GroupRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupRequestsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
