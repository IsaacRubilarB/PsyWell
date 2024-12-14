import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioRecursosComponent } from './formulario-recursos.component';

describe('FormularioRecursosComponent', () => {
  let component: FormularioRecursosComponent;
  let fixture: ComponentFixture<FormularioRecursosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioRecursosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioRecursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
