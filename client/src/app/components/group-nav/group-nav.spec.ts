import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupNavComponent } from './group-nav';

describe('GroupNavComponent', () => {
  let component: GroupNavComponent;
  let fixture: ComponentFixture<GroupNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupNavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupNavComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
