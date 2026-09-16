import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowseGroupsComponent } from './browse-groups';

describe('BrowseGroupsComponent', () => {
  let component: BrowseGroupsComponent;
  let fixture: ComponentFixture<BrowseGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseGroupsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseGroupsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
