import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateRoomRequestComponent } from './create-room-request';

describe('CreateRoomRequestComponent', () => {
  let component: CreateRoomRequestComponent;
  let fixture: ComponentFixture<CreateRoomRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoomRequestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRoomRequestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
