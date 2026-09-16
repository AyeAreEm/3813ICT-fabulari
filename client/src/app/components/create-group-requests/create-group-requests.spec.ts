import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateGroupRequestsComponent } from './create-group-requests';

describe('CreateGroupRequestsComponent', () => {
  let component: CreateGroupRequestsComponent;
  let fixture: ComponentFixture<CreateGroupRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGroupRequestsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGroupRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
