import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginRegistroComponent } from './login-registro.component';

describe('LoginRegistroComponent', () => {
  let component: LoginRegistroComponent;
  let fixture: ComponentFixture<LoginRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginRegistroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
