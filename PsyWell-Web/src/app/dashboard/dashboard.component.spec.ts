import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.psicologoName).toEqual('');
    expect(component.especialidad).toEqual('Psicóloga Especialista en Salud Mental');
    expect(component.aniosExperiencia).toEqual(10);
  });

  it('should filter sticky notes by title', () => {
    component.searchQuery = 'Nota Rápida 1';
    component.onSearch({ target: { value: 'Nota Rápida 1' } });
    expect(component.filteredNotes.length).toBe(1);
  });

  it('should add a new sticky note', () => {
    component.newNoteTitle = 'Nueva Nota';
    component.newNoteContent = 'Contenido de la nueva nota';
    component.addStickyNote();
    expect(component.stickyNotes.length).toBe(3); // Ya había 2 notas
    expect(component.stickyNotes[2].title).toEqual('Nueva Nota');
  });

  it('should remove a sticky note', () => {
    component.removeStickyNote(0);
    expect(component.stickyNotes.length).toBe(1); // Una nota fue eliminada
  });

  it('should update background image on upload', () => {
    const mockFile = new Blob([''], { type: 'image/png' });
    const mockFileEvent = { target: { files: [mockFile] } } as unknown as Event;

    spyOn(component, 'onBackgroundUpload').and.callThrough();
    component.onBackgroundUpload(mockFileEvent);

    expect(component.onBackgroundUpload).toHaveBeenCalled();
  });
});
