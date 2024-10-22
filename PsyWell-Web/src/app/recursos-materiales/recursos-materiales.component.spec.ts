import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecursosMaterialesComponent } from './recursos-materiales.component';

describe('RecursosMaterialesComponent', () => {
  let component: RecursosMaterialesComponent;
  let fixture: ComponentFixture<RecursosMaterialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursosMaterialesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecursosMaterialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
