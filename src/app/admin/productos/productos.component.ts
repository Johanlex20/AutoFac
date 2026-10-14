import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { Producto } from '../../interface/producto.interface';
import { ProductoForm, ProductosService } from '../../productos/productos.service';
import { urlImagenProducto } from '../../shared/imagen-producto.util';

const FORM_VACIO: ProductoForm = {
  nombre: '',
  categoria: '',
  descripcion: '',
  presentacion: '',
  precio: 0,
  imagenUrl: '',
};

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-productos',
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css',
})
export class ProductosComponent implements OnInit, OnDestroy {

  productos: Producto[] = [];
  cargando = true;
  guardando = false;

  paginaActual = 0;
  tamanoPagina = 8;

  modoCreacion = false;
  productoEnEdicion: Producto | null = null;
  form: ProductoForm = { ...FORM_VACIO };

  imagenSeleccionada: File | null = null;
  vistaPreviaNueva: string | null = null;

  urlImagen = urlImagenProducto;

  @ViewChild('imagenInput') imagenInputRef?: ElementRef<HTMLInputElement>;

  constructor(
    private productosService: ProductosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarLista();
  }

  ngOnDestroy(): void {
    this.liberarVistaPrevia();
  }

  get formularioAbierto(): boolean {
    return this.modoCreacion || this.productoEnEdicion !== null;
  }

  get formularioValido(): boolean {
    // precio 0 = "Consultar precio" en la landing
    return this.form.nombre.trim() !== '' && this.form.precio >= 0;
  }

  get vistaPrevia(): string | null {
    if (this.vistaPreviaNueva) return this.vistaPreviaNueva;
    return this.form.imagenUrl ? urlImagenProducto(this.form.imagenUrl) : null;
  }

  get totalPaginas(): number {
    return Math.ceil(this.productos.length / this.tamanoPagina);
  }

  get productosPagina(): Producto[] {
    const inicio = this.paginaActual * this.tamanoPagina;
    return this.productos.slice(inicio, inicio + this.tamanoPagina);
  }

  paginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas - 1) {
      this.paginaActual++;
    }
  }

  cargarLista(): void {
    this.cargando = true;
    this.productosService.listar().subscribe({
      next: (productos) => {
        this.productos = productos;
        // Si se eliminó el último producto de la página, retrocede a una que exista
        this.paginaActual = Math.max(0, Math.min(this.paginaActual, this.totalPaginas - 1));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  nuevoProducto(): void {
    this.modoCreacion = true;
    this.productoEnEdicion = null;
    this.form = { ...FORM_VACIO };
    this.descartarImagenSeleccionada();
  }

  iniciarEdicion(producto: Producto): void {
    this.modoCreacion = false;
    this.productoEnEdicion = producto;
    this.form = {
      nombre: producto.nombre,
      categoria: producto.categoria,
      descripcion: producto.descripcion,
      presentacion: producto.presentacion,
      precio: producto.precio,
      imagenUrl: producto.imagenUrl,
    };
    this.descartarImagenSeleccionada();
  }

  cancelarEdicion(): void {
    this.modoCreacion = false;
    this.productoEnEdicion = null;
    this.form = { ...FORM_VACIO };
    this.descartarImagenSeleccionada();
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) {
      return;
    }

    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      this.rechazarImagen('Formato no permitido', 'Elige una imagen JPG, PNG, WEBP o GIF.');
      return;
    }
    if (archivo.size > MAX_IMAGEN_BYTES) {
      this.rechazarImagen('Imagen muy pesada', 'La imagen no puede superar 5 MB.');
      return;
    }

    this.liberarVistaPrevia();
    this.imagenSeleccionada = archivo;
    this.vistaPreviaNueva = URL.createObjectURL(archivo);
  }

  quitarImagenSeleccionada(): void {
    this.descartarImagenSeleccionada();
  }

  guardarFormulario(): void {
    if (!this.formularioValido) return;

    this.guardando = true;

    // Si hay imagen nueva se sube primero y su ruta reemplaza a la anterior
    const imagen$: Observable<string> = this.imagenSeleccionada
      ? this.productosService.subirImagen(this.imagenSeleccionada).pipe(switchMap((r) => of(r.imagenUrl)))
      : of(this.form.imagenUrl);

    imagen$
      .pipe(
        switchMap((imagenUrl) => {
          const datos: ProductoForm = { ...this.form, imagenUrl };
          return this.productoEnEdicion
            ? this.productosService.actualizar(this.productoEnEdicion.id, datos)
            : this.productosService.crear(datos);
        })
      )
      .subscribe({
        next: () => {
          this.guardando = false;
          this.cancelarEdicion();
          this.cargarLista();
        },
        error: (err) => {
          this.guardando = false;
          const mensaje = err?.error?.mensaje ?? 'Intenta de nuevo.';
          Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: mensaje });
          this.cdr.detectChanges();
        }
      });
  }

  async eliminar(producto: Producto): Promise<void> {
    const resultado = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `"${producto.nombre}" — esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    });

    if (!resultado.isConfirmed) {
      return;
    }

    this.productosService.eliminar(producto.id).subscribe({
      next: () => {
        this.cargarLista();
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: 'Intenta de nuevo.' });
        this.cdr.detectChanges();
      }
    });
  }

  formatoPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  private rechazarImagen(titulo: string, texto: string): void {
    if (this.imagenInputRef) {
      this.imagenInputRef.nativeElement.value = '';
    }
    Swal.fire({ icon: 'warning', title: titulo, text: texto });
  }

  private descartarImagenSeleccionada(): void {
    this.liberarVistaPrevia();
    this.imagenSeleccionada = null;
    if (this.imagenInputRef) {
      this.imagenInputRef.nativeElement.value = '';
    }
  }

  private liberarVistaPrevia(): void {
    if (this.vistaPreviaNueva) {
      URL.revokeObjectURL(this.vistaPreviaNueva);
      this.vistaPreviaNueva = null;
    }
  }
}
