import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateGroupRequests } from './create-group-requests';

describe('CreateGroupRequests', () => {
  let component: CreateGroupRequests;
  let fixture: ComponentFixture<CreateGroupRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGroupRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGroupRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
