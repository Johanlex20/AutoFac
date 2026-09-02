import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../auth/auth.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  constructor(
    private host: ElementRef<HTMLElement>,
    private authService: AuthService
  ) {}

  menuMovilAbierto = false;

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
