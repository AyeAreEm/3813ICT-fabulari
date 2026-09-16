import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminShellComponent } from './admin-shell';

describe('AdminShellComponent', () => {
  let component: AdminShellComponent;
  let fixture: ComponentFixture<AdminShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminShellComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
