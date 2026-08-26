import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupNav } from './group-nav';

describe('GroupNav', () => {
  let component: GroupNav;
  let fixture: ComponentFixture<GroupNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupNav],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
