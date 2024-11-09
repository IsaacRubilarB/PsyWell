import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleFitComponent } from './google-fit.component';

describe('GoogleFitComponent', () => {
  let component: GoogleFitComponent;
  let fixture: ComponentFixture<GoogleFitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleFitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleFitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
