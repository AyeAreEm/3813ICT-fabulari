import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BanRequestsComponent } from './ban-requests';

describe('BanRequestsComponent', () => {
  let component: BanRequestsComponent;
  let fixture: ComponentFixture<BanRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanRequestsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BanRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
