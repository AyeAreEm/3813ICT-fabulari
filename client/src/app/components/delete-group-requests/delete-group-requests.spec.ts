import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteGroupRequestsComponent } from './delete-group-requests';

describe('DeleteGroupRequestsComponent', () => {
  let component: DeleteGroupRequestsComponent;
  let fixture: ComponentFixture<DeleteGroupRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteGroupRequestsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteGroupRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
