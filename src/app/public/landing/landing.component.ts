import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../auth/auth.service';
import { ProductosPublicoService } from '../productos/productos-publico.service';
import { Producto } from '../../interface/producto.interface';
import Swal from 'sweetalert2';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-landing',
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private host: ElementRef<HTMLElement>,
    private authService: AuthService,
    private productosService: ProductosPublicoService,
    private cdr: ChangeDetectorRef
  ) {}

  menuMovilAbierto = false;
  productos: Producto[] = [];

  formatoPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  agregarAlCarrito(producto: Producto): void {
    Swal.fire({
      icon: 'success',
      title: 'Producto agregado',
      text: `${producto.nombre} — muy pronto podrás completar tu pedido desde aquí.`,
      timer: 2000,
      showConfirmButton: false,
    });
  }

  ngOnInit(): void {
    this.productosService.listar().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }

  estaAutenticado(): boolean {
    return this.authService.isAuthenticated();
  }

  cerrarSesion(): void {
    this.authService.logout();
  }

  toggleMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  ngAfterViewInit(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const root = this.host.nativeElement;

    gsap.from(root.querySelectorAll('.hero-animate'), {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.1,
    });

    root.querySelectorAll('.stagger-group').forEach((group) => {
      gsap.from(group.querySelectorAll('.stagger-item'), {
        scrollTrigger: {
          trigger: group,
          start: 'top 80%',
        },
        opacity: 0,
        y: 16,
        scale: 0.92,
        duration: 0.4,
        ease: 'back.out(1.4)',
        stagger: { each: 0.06, from: 'start' },
      });
    });
  }

  ngOnDestroy(): void {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}
