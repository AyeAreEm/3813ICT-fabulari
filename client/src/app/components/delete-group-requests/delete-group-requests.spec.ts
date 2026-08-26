import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteGroupRequests } from './delete-group-requests';

describe('DeleteGroupRequests', () => {
  let component: DeleteGroupRequests;
  let fixture: ComponentFixture<DeleteGroupRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteGroupRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteGroupRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
