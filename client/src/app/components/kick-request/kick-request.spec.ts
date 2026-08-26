import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KickRequest } from './kick-request';

describe('KickRequest', () => {
  let component: KickRequest;
  let fixture: ComponentFixture<KickRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KickRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(KickRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
