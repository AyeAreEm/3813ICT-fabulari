import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BanRequests } from './ban-requests';

describe('BanRequests', () => {
  let component: BanRequests;
  let fixture: ComponentFixture<BanRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(BanRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
