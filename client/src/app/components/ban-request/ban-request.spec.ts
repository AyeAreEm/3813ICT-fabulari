import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BanRequestComponent } from './ban-request';

describe('BanRequestComponent', () => {
  let component: BanRequestComponent;
  let fixture: ComponentFixture<BanRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanRequestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BanRequestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
