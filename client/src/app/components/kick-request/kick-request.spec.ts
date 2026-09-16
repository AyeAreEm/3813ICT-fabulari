import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KickRequestComponent } from './kick-request';

describe('KickRequestComponent', () => {
  let component: KickRequestComponent;
  let fixture: ComponentFixture<KickRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KickRequestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KickRequestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
