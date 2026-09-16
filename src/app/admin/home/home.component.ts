import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Data } from '../../interface/data.interfaces';
import { DashBoardService } from '../../dash-board/dash-board.service';
import { aFechaISO } from '../../shared/fecha.util';
import { BarChartComponent, BarChartItem } from '../../shared/bar-chart/bar-chart.component';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_A_MOSTRAR = 6;
const TOP_CLIENTES_A_MOSTRAR = 6;

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

@Component({
  selector: 'app-home',
  imports: [CommonModule, BarChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  cargando = true;

  totalFacturas = 0;
  valorTotalFacturado = 0;
  promedioPorFactura = 0;

  facturasPorMes: BarChartItem[] = [];
  valorPorMes: BarChartItem[] = [];
  porFormaPago: BarChartItem[] = [];
  topClientes: BarChartItem[] = [];

  formatoConteo = (v: number) => `${v}`;
  formatoMoneda = (v: number) => formatoMoneda.format(v);

  constructor(
    private dataService: DashBoardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataService.list(0, 5000).subscribe({
      next: (pagina) => {
        this.calcular(pagina.content);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private calcular(registros: Data[]): void {
    this.totalFacturas = registros.length;

    const valores = registros.map((r) => this.parseValor(r.valorTotal));
    this.valorTotalFacturado = valores.reduce((acc, v) => acc + v, 0);
    this.promedioPorFactura = this.totalFacturas > 0 ? this.valorTotalFacturado / this.totalFacturas : 0;

    this.facturasPorMes = this.agruparPorMes(registros, 'contar');
    this.valorPorMes = this.agruparPorMes(registros, 'sumar');
    this.porFormaPago = this.agruparPorCampo(registros, 'formaPago');
    this.topClientes = this.agruparValorPorCliente(registros);
  }

  private parseValor(valor: string): number {
    if (!valor) {
      return 0;
    }
    const soloNumeros = valor.replace(/[^\d.,-]/g, '').replace(/,/g, '');
    const numero = parseFloat(soloNumeros);
    return isNaN(numero) ? 0 : numero;
  }

  private agruparPorMes(registros: Data[], modo: 'contar' | 'sumar'): BarChartItem[] {
    const acumulado = new Map<string, number>();

    for (const registro of registros) {
      const iso = aFechaISO(registro.fechaGeneracion);
      if (!iso) {
        continue;
      }
      const [anio, mes] = iso.split('-');
      const clave = `${anio}-${mes}`;
      const incremento = modo === 'contar' ? 1 : this.parseValor(registro.valorTotal);
      acumulado.set(clave, (acumulado.get(clave) ?? 0) + incremento);
    }

    return Array.from(acumulado.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-MESES_A_MOSTRAR)
      .map(([clave, valor]) => {
        const [anio, mes] = clave.split('-');
        const nombreMes = MESES[Number(mes) - 1] ?? mes;
        return { etiqueta: `${nombreMes} ${anio.slice(2)}`, valor };
      });
  }

  private agruparPorCampo(registros: Data[], campo: keyof Data): BarChartItem[] {
    const acumulado = new Map<string, number>();

    for (const registro of registros) {
      const valor = (registro[campo] ?? '').toString().trim() || 'Sin dato';
      acumulado.set(valor, (acumulado.get(valor) ?? 0) + 1);
    }

    return Array.from(acumulado.entries())
      .map(([etiqueta, valor]) => ({ etiqueta, valor }))
      .sort((a, b) => b.valor - a.valor);
  }

  private agruparValorPorCliente(registros: Data[]): BarChartItem[] {
    const acumulado = new Map<string, number>();

    for (const registro of registros) {
      const cliente = (registro.cliente ?? '').trim() || 'Sin dato';
      acumulado.set(cliente, (acumulado.get(cliente) ?? 0) + this.parseValor(registro.valorTotal));
    }

    return Array.from(acumulado.entries())
      .map(([etiqueta, valor]) => ({ etiqueta, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, TOP_CLIENTES_A_MOSTRAR);
  }
}
