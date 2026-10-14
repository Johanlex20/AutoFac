import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { Perfil, PerfilService } from '../perfil/perfil.service';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;
const TELEFONO_VALIDO = /^[+0-9 ()-]{7,20}$/;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class UserComponent implements OnInit {

  perfil: Perfil | null = null;
  cargando = true;
  errorCarga = false;

  form = { email: '', nombre: '', telefono: '' };
  guardando = false;

  passwordForm = { actual: '', nueva: '', confirmar: '' };
  guardandoPassword = false;

  subiendoFoto = false;

  @ViewChild('fotoInput') fotoInputRef?: ElementRef<HTMLInputElement>;

  constructor(
    private perfilService: PerfilService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.perfilService.cargar().subscribe({
      next: (perfil) => {
        this.aplicarPerfil(perfil);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.errorCarga = true;
        this.cdr.detectChanges();
      }
    });
  }

  get fotoUrl(): string | null {
    return this.perfilService.urlFoto(this.perfil?.fotoUrl);
  }

  get iniciales(): string {
    const base = (this.perfil?.nombre || this.perfil?.email || '?').trim();
    const partes = base.split(/[\s@._-]+/).filter(Boolean);
    const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : base.slice(0, 2);
    return letras.toUpperCase();
  }

  get datosCambiaron(): boolean {
    if (!this.perfil) return false;
    return (
      this.form.email.trim() !== this.perfil.email ||
      this.form.nombre.trim() !== (this.perfil.nombre ?? '') ||
      this.form.telefono.trim() !== (this.perfil.telefono ?? '')
    );
  }

  get errorDatos(): string | null {
    if (!EMAIL_VALIDO.test(this.form.email.trim())) {
      return 'Escribe un correo válido.';
    }
    const telefono = this.form.telefono.trim();
    if (telefono && !TELEFONO_VALIDO.test(telefono)) {
      return 'El teléfono solo puede tener números, espacios, +, - y paréntesis (7 a 20 caracteres).';
    }
    return null;
  }

  get errorPassword(): string | null {
    const { actual, nueva, confirmar } = this.passwordForm;
    if (!actual) return 'Escribe tu contraseña actual.';
    if (nueva.length < 8) return 'La nueva contraseña debe tener al menos 8 caracteres.';
    if (nueva !== confirmar) return 'La confirmación no coincide con la nueva contraseña.';
    return null;
  }

  guardarDatos(): void {
    if (this.errorDatos || !this.datosCambiaron) return;

    const cambioCorreo = this.form.email.trim() !== this.perfil?.email;
    this.guardando = true;

    this.perfilService.actualizar({
      email: this.form.email.trim(),
      nombre: this.form.nombre.trim(),
      telefono: this.form.telefono.trim(),
    }).subscribe({
      next: (perfil) => {
        this.guardando = false;
        this.aplicarPerfil(perfil);
        this.avisar(cambioCorreo ? 'Datos guardados. Usa tu nuevo correo la próxima vez que inicies sesión.' : 'Datos guardados.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError('No se pudieron guardar los datos', err);
        this.cdr.detectChanges();
      }
    });
  }

  cambiarPassword(): void {
    if (this.errorPassword) return;

    this.guardandoPassword = true;
    this.perfilService.cambiarPassword(this.passwordForm.actual, this.passwordForm.nueva).subscribe({
      next: () => {
        this.guardandoPassword = false;
        this.passwordForm = { actual: '', nueva: '', confirmar: '' };
        this.avisar('Contraseña actualizada.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardandoPassword = false;
        this.mostrarError('No se pudo cambiar la contraseña', err);
        this.cdr.detectChanges();
      }
    });
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      this.limpiarInputFoto();
      Swal.fire({ icon: 'warning', title: 'Formato no permitido', text: 'Elige una imagen JPG, PNG, WEBP o GIF.' });
      return;
    }
    if (archivo.size > MAX_IMAGEN_BYTES) {
      this.limpiarInputFoto();
      Swal.fire({ icon: 'warning', title: 'Imagen muy pesada', text: 'La imagen no puede superar 5 MB.' });
      return;
    }

    this.subiendoFoto = true;
    this.perfilService.subirFoto(archivo).subscribe({
      next: (perfil) => {
        this.subiendoFoto = false;
        this.perfil = perfil;
        this.limpiarInputFoto();
        this.avisar('Foto actualizada.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.subiendoFoto = false;
        this.limpiarInputFoto();
        this.mostrarError('No se pudo subir la foto', err);
        this.cdr.detectChanges();
      }
    });
  }

  quitarFoto(): void {
    this.subiendoFoto = true;
    this.perfilService.quitarFoto().subscribe({
      next: (perfil) => {
        this.subiendoFoto = false;
        this.perfil = perfil;
        this.avisar('Foto eliminada.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.subiendoFoto = false;
        this.mostrarError('No se pudo quitar la foto', err);
        this.cdr.detectChanges();
      }
    });
  }

  private aplicarPerfil(perfil: Perfil): void {
    this.perfil = perfil;
    this.form = {
      email: perfil.email,
      nombre: perfil.nombre ?? '',
      telefono: perfil.telefono ?? '',
    };
  }

  private limpiarInputFoto(): void {
    if (this.fotoInputRef) {
      this.fotoInputRef.nativeElement.value = '';
    }
  }

  private avisar(titulo: string): void {
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: titulo, timer: 2500, showConfirmButton: false });
  }

  private mostrarError(titulo: string, err: any): void {
    const mensaje = err?.error?.mensaje ?? 'Intenta de nuevo.';
    Swal.fire({ icon: 'error', title: titulo, text: mensaje });
  }
}
