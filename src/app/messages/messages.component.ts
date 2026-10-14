import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { DashBoardService } from '../dash-board/dash-board.service';
import { Data } from '../interface/data.interfaces';
import { Producto } from '../interface/producto.interface';
import { Documento } from '../documentos/documento.interface';
import { DocumentosService } from '../documentos/documentos.service';
import { ProductosService } from '../productos/productos.service';
import { Perfil, PerfilService } from '../perfil/perfil.service';
import { aFechaISO } from '../shared/fecha.util';
import { parseValorMonetario } from '../shared/valor.util';

export type Severidad = 'critica' | 'advertencia' | 'info' | 'exito';
export type Categoria = 'siigo' | 'productos' | 'documentos' | 'sistema';

export interface Notificacion {
  /** Estable entre recargas para recordar si ya se leyo. Las alertas con conteo lo incluyen: si cambia, vuelve a salir sin leer. */
  id: string;
  severidad: Severidad;
  categoria: Categoria;
  icono: string;
  titulo: string;
  detalle: string;
  fecha?: Date;
  accion?: { texto: string; ruta: string };
}

export interface Evento {
  icono: string;
  categoria: Categoria;
  texto: string;
  detalle: string;
  fecha: Date;
}

export interface EstadoSistema {
  nombre: string;
  icono: string;
  estado: 'ok' | 'aviso' | 'error';
  detalle: string;
}

const CLAVE_LEIDAS = 'autofac_notificaciones_leidas';
const MAX_LEIDAS_GUARDADAS = 500;
const DIAS_SIN_CAPTURAS_AVISO = 3;
const DIAS_VENCIDAS_RECIENTES = 30;
const DIAS_POR_VENCER = 7;

const moneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class MessagesComponent implements OnInit {

  cargando = true;

  notificaciones: Notificacion[] = [];
  actividad: Evento[] = [];
  estados: EstadoSistema[] = [];

  // Resumen de Siigo (panel lateral)
  totalFacturas = 0;
  facturadoMesActual = 0;
  variacionMes: number | null = null;
  nombreMesActual = '';
  ultimaCaptura = '';

  filtroSeveridad: Severidad | 'sinLeer' | null = null;
  filtroCategoria: Categoria | 'todas' = 'todas';

  categorias: { clave: Categoria | 'todas'; texto: string; icono: string }[] = [
    { clave: 'todas', texto: 'Todas', icono: 'notifications' },
    { clave: 'siigo', texto: 'Siigo', icono: 'receipt_long' },
    { clave: 'productos', texto: 'Productos', icono: 'inventory_2' },
    { clave: 'documentos', texto: 'Documentos', icono: 'folder' },
    { clave: 'sistema', texto: 'Sistema', icono: 'settings' },
  ];

  private leidas = new Set<string>();

  formatoMoneda = (v: number) => moneda.format(v);

  constructor(
    private dataService: DashBoardService,
    private productosService: ProductosService,
    private documentosService: DocumentosService,
    private perfilService: PerfilService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.leidas = this.leerLeidas();
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;

    // Cada fuente falla por separado: si una no responde, el resto se muestra y se avisa del error
    forkJoin({
      facturas: this.dataService.list(0, 5000).pipe(catchError(() => of(null))),
      productos: this.productosService.listar().pipe(catchError(() => of(null))),
      documentos: this.documentosService.listar().pipe(catchError(() => of(null))),
      perfil: this.perfilService.cargar().pipe(catchError(() => of(null))),
    }).subscribe(({ facturas, productos, documentos, perfil }) => {
      this.construir(facturas?.content ?? null, productos, documentos, perfil);
      this.cargando = false;
      this.cdr.detectChanges();
    });
  }

  // ---------- Estado de lectura ----------

  estaLeida(n: Notificacion): boolean {
    return this.leidas.has(n.id);
  }

  alternarLeida(n: Notificacion): void {
    if (this.leidas.has(n.id)) {
      this.leidas.delete(n.id);
    } else {
      this.leidas.add(n.id);
    }
    this.guardarLeidas();
  }

  marcarTodasLeidas(): void {
    this.notificaciones.forEach((n) => this.leidas.add(n.id));
    this.guardarLeidas();
  }

  // ---------- Filtros y contadores ----------

  get sinLeer(): number {
    return this.notificaciones.filter((n) => !this.estaLeida(n)).length;
  }

  contar(severidad: Severidad): number {
    return this.notificaciones.filter((n) => n.severidad === severidad).length;
  }

  contarCategoria(categoria: Categoria | 'todas'): number {
    return categoria === 'todas'
      ? this.notificaciones.length
      : this.notificaciones.filter((n) => n.categoria === categoria).length;
  }

  get filtradas(): Notificacion[] {
    return this.notificaciones.filter((n) => {
      if (this.filtroCategoria !== 'todas' && n.categoria !== this.filtroCategoria) return false;
      if (this.filtroSeveridad === 'sinLeer') return !this.estaLeida(n);
      if (this.filtroSeveridad) return n.severidad === this.filtroSeveridad;
      return true;
    });
  }

  alternarFiltroSeveridad(f: Severidad | 'sinLeer'): void {
    this.filtroSeveridad = this.filtroSeveridad === f ? null : f;
  }

  limpiarFiltros(): void {
    this.filtroSeveridad = null;
    this.filtroCategoria = 'todas';
  }

  // ---------- Presentacion ----------

  hace(fecha: Date | undefined): string {
    if (!fecha) return '';
    const dias = this.diasEntre(fecha, new Date());
    if (dias <= 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 30) return `Hace ${dias} días`;
    return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  get variacionTexto(): string {
    if (this.variacionMes === null) return 'Sin mes anterior para comparar';
    const signo = this.variacionMes > 0 ? '+' : '';
    return `${signo}${this.variacionMes.toFixed(1)}% frente al mes anterior`;
  }

  // ---------- Construccion de las notificaciones ----------

  private construir(
    facturas: Data[] | null,
    productos: Producto[] | null,
    documentos: Documento[] | null,
    perfil: Perfil | null
  ): void {
    const lista: Notificacion[] = [];
    const eventos: Evento[] = [];
    const estados: EstadoSistema[] = [];

    const hoy = new Date();
    this.nombreMesActual = MESES[hoy.getMonth()];

    // --- Facturas / Siigo ---
    if (facturas === null) {
      lista.push({
        id: 'facturas-error', severidad: 'critica', categoria: 'siigo', icono: 'cloud_off',
        titulo: 'No se pudieron cargar las facturas',
        detalle: 'El servidor no respondió al pedir los registros de Siigo. Revisa la conexión y vuelve a intentarlo.',
        accion: { texto: 'Reintentar', ruta: '' },
      });
      estados.push({ nombre: 'Facturas de Siigo', icono: 'receipt_long', estado: 'error', detalle: 'Sin respuesta del servidor' });
    } else {
      this.analizarFacturas(facturas, hoy, lista, eventos, estados);
    }

    // --- Productos ---
    if (productos === null) {
      lista.push({
        id: 'productos-error', severidad: 'critica', categoria: 'productos', icono: 'cloud_off',
        titulo: 'No se pudo cargar el catálogo de productos',
        detalle: 'El servidor no respondió al pedir los productos.',
      });
      estados.push({ nombre: 'Catálogo de productos', icono: 'inventory_2', estado: 'error', detalle: 'Sin respuesta del servidor' });
    } else {
      this.analizarProductos(productos, lista, estados);
    }

    // --- Documentos ---
    if (documentos === null) {
      estados.push({ nombre: 'Documentos', icono: 'folder', estado: 'error', detalle: 'Sin respuesta del servidor' });
    } else {
      this.analizarDocumentos(documentos, lista, eventos, estados);
    }

    // --- Cuenta ---
    if (perfil) {
      const faltan: string[] = [];
      if (!perfil.fotoUrl) faltan.push('foto');
      if (!perfil.nombre) faltan.push('nombre');
      if (!perfil.telefono) faltan.push('teléfono');
      if (faltan.length > 0) {
        lista.push({
          id: `perfil-incompleto-${faltan.join('-')}`, severidad: 'info', categoria: 'sistema', icono: 'account_circle',
          titulo: 'Completa tu perfil',
          detalle: `Todavía te falta agregar: ${faltan.join(', ')}.`,
          accion: { texto: 'Ir a mi perfil', ruta: '/admin/usuarios/list' },
        });
      } else {
        lista.push({
          id: 'perfil-completo', severidad: 'exito', categoria: 'sistema', icono: 'verified_user',
          titulo: 'Tu perfil está completo',
          detalle: 'Foto, nombre y teléfono configurados.',
        });
      }
    }

    const algunaFuenteRespondio = facturas !== null || productos !== null || documentos !== null;
    estados.unshift({
      nombre: 'Servidor (API)', icono: 'dns',
      estado: algunaFuenteRespondio ? 'ok' : 'error',
      detalle: algunaFuenteRespondio ? 'Conectado' : 'No responde',
    });
    if (algunaFuenteRespondio) {
      lista.push({
        id: 'servidor-ok', severidad: 'exito', categoria: 'sistema', icono: 'cloud_done',
        titulo: 'Servidor conectado',
        detalle: 'La aplicación está recibiendo datos del servidor con normalidad.', fecha: hoy,
      });
    }

    // Lo mas urgente primero; dentro de cada gravedad, lo mas reciente
    const peso: Record<Severidad, number> = { critica: 0, advertencia: 1, info: 2, exito: 3 };
    this.notificaciones = lista.sort(
      (a, b) => peso[a.severidad] - peso[b.severidad] || (b.fecha?.getTime() ?? 0) - (a.fecha?.getTime() ?? 0)
    );
    this.actividad = eventos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 7);
    this.estados = estados;
  }

  private analizarFacturas(facturas: Data[], hoy: Date, lista: Notificacion[], eventos: Evento[], estados: EstadoSistema[]): void {
    this.totalFacturas = facturas.length;
    const rutaRegistros = '/admin/registros/list';

    const conFecha = facturas.map((f) => ({
      f,
      gen: this.aFecha(f.fechaGeneracion),
      venc: this.aFecha(f.fechaVencimiento),
      valor: parseValorMonetario(f.valorTotal),
    }));

    // Ultima captura / sincronizacion con Siigo
    const fechas = conFecha.map((x) => x.gen).filter((d): d is Date => !!d);
    const ultima = fechas.length ? new Date(Math.max(...fechas.map((d) => d.getTime()))) : null;
    if (ultima) {
      this.ultimaCaptura = ultima.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
      const dias = this.diasEntre(ultima, hoy);
      if (dias >= DIAS_SIN_CAPTURAS_AVISO) {
        lista.push({
          id: `siigo-sin-capturas-${ultima.toISOString().slice(0, 10)}`, severidad: 'advertencia', categoria: 'siigo', icono: 'sync_problem',
          titulo: `Sin facturas nuevas hace ${dias} días`,
          detalle: `La última factura capturada es del ${this.ultimaCaptura}. Si ya emitiste más en Siigo, revisa la sincronización automática.`,
          fecha: ultima, accion: { texto: 'Ver registros', ruta: rutaRegistros },
        });
        estados.push({ nombre: 'Sincronización con Siigo', icono: 'sync', estado: 'aviso', detalle: `Última captura hace ${dias} días` });
      } else {
        estados.push({ nombre: 'Sincronización con Siigo', icono: 'sync', estado: 'ok', detalle: dias <= 0 ? 'Capturando hoy' : `Última captura hace ${dias} día(s)` });
      }
    } else {
      estados.push({ nombre: 'Sincronización con Siigo', icono: 'sync', estado: 'aviso', detalle: 'Aún no hay facturas capturadas' });
    }

    // Credito: fecha de vencimiento cumplida (ultimos 30 dias) y por vencer (proximos 7)
    const credito = conFecha.filter((x) => /cr[eé]dito/i.test(x.f.formaPago ?? '') && x.venc);
    const vencidas = credito.filter((x) => {
      const d = this.diasEntre(x.venc!, hoy);
      return d > 0 && d <= DIAS_VENCIDAS_RECIENTES;
    });
    const porVencer = credito.filter((x) => {
      const d = this.diasEntre(hoy, x.venc!);
      return d >= 0 && d <= DIAS_POR_VENCER;
    });

    if (vencidas.length > 0) {
      const total = vencidas.reduce((s, x) => s + x.valor, 0);
      lista.push({
        id: `fact-vencidas-${vencidas.length}`, severidad: 'critica', categoria: 'siigo', icono: 'event_busy',
        titulo: `${vencidas.length} factura(s) a crédito con vencimiento cumplido`,
        detalle: `Vencieron en los últimos ${DIAS_VENCIDAS_RECIENTES} días, por ${moneda.format(total)}. Verifica en Siigo si ya fueron pagadas.`,
        accion: { texto: 'Ver registros', ruta: rutaRegistros },
      });
    }
    if (porVencer.length > 0) {
      const total = porVencer.reduce((s, x) => s + x.valor, 0);
      lista.push({
        id: `fact-por-vencer-${porVencer.length}`, severidad: 'advertencia', categoria: 'siigo', icono: 'schedule',
        titulo: `${porVencer.length} factura(s) a crédito vencen en los próximos ${DIAS_POR_VENCER} días`,
        detalle: `Suman ${moneda.format(total)}. Es buen momento para avisar a los clientes.`,
        accion: { texto: 'Ver registros', ruta: rutaRegistros },
      });
    }

    // Registros con datos faltantes
    const incompletas = conFecha.filter((x) => !x.f.cliente?.trim() || !x.f.nit?.trim() || x.valor <= 0);
    if (incompletas.length > 0) {
      lista.push({
        id: `fact-incompletas-${incompletas.length}`, severidad: 'advertencia', categoria: 'siigo', icono: 'rule',
        titulo: `${incompletas.length} registro(s) con datos incompletos`,
        detalle: 'Les falta cliente, NIT o tienen un valor total en cero. Conviene corregirlos.',
        accion: { texto: 'Revisar registros', ruta: rutaRegistros },
      });
    }

    // Mes actual contra mes anterior
    const claveMes = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
    const mesActual = claveMes(hoy);
    const mesPrevio = claveMes(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1));
    const delMes = conFecha.filter((x) => x.gen && claveMes(x.gen) === mesActual);
    const delPrevio = conFecha.filter((x) => x.gen && claveMes(x.gen) === mesPrevio);
    this.facturadoMesActual = delMes.reduce((s, x) => s + x.valor, 0);
    const facturadoPrevio = delPrevio.reduce((s, x) => s + x.valor, 0);
    this.variacionMes = facturadoPrevio > 0 ? ((this.facturadoMesActual - facturadoPrevio) / facturadoPrevio) * 100 : null;

    if (this.variacionMes !== null && delMes.length > 0) {
      const sube = this.variacionMes >= 0;
      lista.push({
        id: `mes-vs-anterior-${mesActual}-${Math.round(this.variacionMes)}`,
        severidad: sube ? 'exito' : 'advertencia', categoria: 'siigo', icono: sube ? 'trending_up' : 'trending_down',
        titulo: `Facturación de ${this.nombreMesActual}: ${sube ? 'va arriba' : 'va por debajo'} del mes anterior`,
        detalle: `${moneda.format(this.facturadoMesActual)} en ${delMes.length} factura(s) (${this.variacionTexto}).`,
        accion: { texto: 'Ver el dashboard', ruta: '/admin/home' },
      });
    }

    // Cliente que mas compro este mes
    if (delMes.length > 0) {
      const porCliente = new Map<string, number>();
      delMes.forEach((x) => {
        const c = x.f.cliente?.trim() || 'Sin dato';
        porCliente.set(c, (porCliente.get(c) ?? 0) + x.valor);
      });
      const [cliente, valor] = [...porCliente.entries()].sort((a, b) => b[1] - a[1])[0];
      lista.push({
        id: `cliente-top-${mesActual}-${cliente}`, severidad: 'info', categoria: 'siigo', icono: 'workspace_premium',
        titulo: `Cliente destacado de ${this.nombreMesActual}`,
        detalle: `${cliente} lleva ${moneda.format(valor)} facturados este mes.`,
      });
    }

    // Ultimas facturas capturadas (las de id mas alto)
    [...conFecha].sort((a, b) => (b.f.id ?? 0) - (a.f.id ?? 0)).slice(0, 5).forEach((x) => {
      const fecha = x.gen ?? undefined;
      lista.push({
        id: `factura-${x.f.id}`, severidad: 'info', categoria: 'siigo', icono: 'receipt_long',
        titulo: `Factura ${x.f.numeroFactura || '#' + x.f.id} capturada`,
        detalle: `${x.f.cliente || 'Sin cliente'} · ${moneda.format(x.valor)} · ${x.f.formaPago || 'forma de pago sin dato'}`,
        fecha, accion: { texto: 'Ver', ruta: rutaRegistros },
      });
      if (fecha) {
        eventos.push({
          icono: 'receipt_long', categoria: 'siigo', fecha,
          texto: `Factura ${x.f.numeroFactura || '#' + x.f.id}`,
          detalle: `${x.f.cliente || 'Sin cliente'} · ${moneda.format(x.valor)}`,
        });
      }
    });
  }

  private analizarProductos(productos: Producto[], lista: Notificacion[], estados: EstadoSistema[]): void {
    const rutaProductos = '/admin/productos/list';
    const sinPrecio = productos.filter((p) => !(p.precio > 0));
    const sinFoto = productos.filter((p) => !p.imagenUrl || p.imagenUrl.includes('envase-'));

    if (sinPrecio.length > 0) {
      lista.push({
        id: `prod-sin-precio-${sinPrecio.length}`, severidad: 'advertencia', categoria: 'productos', icono: 'sell',
        titulo: `${sinPrecio.length} producto(s) sin precio`,
        detalle: `En la página aparecen como "Consultar precio": ${sinPrecio.slice(0, 4).map((p) => `${p.nombre} (${p.presentacion})`).join(', ')}${sinPrecio.length > 4 ? '…' : ''}.`,
        accion: { texto: 'Poner precios', ruta: rutaProductos },
      });
    }
    if (sinFoto.length > 0) {
      lista.push({
        id: `prod-sin-foto-${sinFoto.length}`, severidad: 'info', categoria: 'productos', icono: 'add_photo_alternate',
        titulo: `${sinFoto.length} producto(s) con imagen genérica`,
        detalle: `Todavía usan el envase de muestra: ${sinFoto.slice(0, 4).map((p) => p.nombre).join(', ')}${sinFoto.length > 4 ? '…' : ''}.`,
        accion: { texto: 'Subir fotos', ruta: rutaProductos },
      });
    }
    lista.push({
      id: `catalogo-${productos.length}`, severidad: 'exito', categoria: 'productos', icono: 'storefront',
      titulo: `${productos.length} producto(s) publicados en la página`,
      detalle: `${new Set(productos.map((p) => p.categoria)).size} categoría(s) en el catálogo.`,
      accion: { texto: 'Administrar', ruta: rutaProductos },
    });

    estados.push({
      nombre: 'Catálogo de productos', icono: 'inventory_2',
      estado: sinPrecio.length > 0 ? 'aviso' : 'ok',
      detalle: sinPrecio.length > 0 ? `${sinPrecio.length} sin precio` : `${productos.length} con precio`,
    });
  }

  private analizarDocumentos(documentos: Documento[], lista: Notificacion[], eventos: Evento[], estados: EstadoSistema[]): void {
    const recientes = [...documentos]
      .filter((d) => d.fechaSubida)
      .sort((a, b) => new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime());

    recientes.slice(0, 3).forEach((d) => {
      const fecha = new Date(d.fechaSubida);
      lista.push({
        id: `doc-${d.id}`, severidad: 'info', categoria: 'documentos', icono: 'description',
        titulo: 'Documento subido',
        detalle: d.nombreOriginal, fecha,
        accion: { texto: 'Ver documentos', ruta: '/admin/documentos/list' },
      });
      eventos.push({ icono: 'description', categoria: 'documentos', fecha, texto: 'Documento subido', detalle: d.nombreOriginal });
    });

    estados.push({
      nombre: 'Documentos', icono: 'folder', estado: 'ok',
      detalle: `${documentos.length} archivo(s) guardado(s)`,
    });
  }

  // ---------- Utilidades ----------

  private aFecha(texto: string): Date | null {
    const iso = aFechaISO(texto);
    if (!iso) return null;
    const [a, m, d] = iso.split('-').map(Number);
    return new Date(a, m - 1, d);
  }

  /** Dias completos entre dos fechas (positivo si `hasta` es posterior a `desde`). */
  private diasEntre(desde: Date, hasta: Date): number {
    const a = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate()).getTime();
    const b = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate()).getTime();
    return Math.round((b - a) / 86_400_000);
  }

  private leerLeidas(): Set<string> {
    try {
      const guardado = localStorage.getItem(CLAVE_LEIDAS);
      return new Set<string>(guardado ? JSON.parse(guardado) : []);
    } catch {
      return new Set<string>();
    }
  }

  private guardarLeidas(): void {
    try {
      localStorage.setItem(CLAVE_LEIDAS, JSON.stringify([...this.leidas].slice(-MAX_LEIDAS_GUARDADAS)));
    } catch {
      // Sin almacenamiento: las lecturas se mantienen solo mientras la pagina siga abierta
    }
  }
}
