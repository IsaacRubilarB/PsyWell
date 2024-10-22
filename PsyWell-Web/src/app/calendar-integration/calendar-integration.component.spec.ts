import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarIntegrationComponent } from './calendar-integration.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

describe('CalendarIntegrationComponent', () => {
  let component: CalendarIntegrationComponent;
  let fixture: ComponentFixture<CalendarIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule],
      declarations: [CalendarIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
