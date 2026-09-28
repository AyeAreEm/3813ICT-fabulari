import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateRoomRequest } from './create-room-request';

describe('CreateRoomRequest', () => {
  let component: CreateRoomRequest;
  let fixture: ComponentFixture<CreateRoomRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoomRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRoomRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
