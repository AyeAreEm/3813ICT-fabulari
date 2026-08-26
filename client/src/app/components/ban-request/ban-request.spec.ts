import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BanRequest } from './ban-request';

describe('BanRequest', () => {
  let component: BanRequest;
  let fixture: ComponentFixture<BanRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(BanRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
