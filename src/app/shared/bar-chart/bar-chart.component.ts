import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface BarChartItem {
  etiqueta: string;
  valor: number;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-chart.component.html',
})
export class BarChartComponent {
  @Input() titulo = '';
  @Input() datos: BarChartItem[] = [];
  @Input() orientacion: 'vertical' | 'horizontal' = 'vertical';
  @Input() formatoValor: (valor: number) => string = (v) => `${v}`;
  @Input() vacioMensaje = 'No hay datos suficientes todavía.';

  get maximo(): number {
    return Math.max(1, ...this.datos.map((d) => d.valor));
  }

  porcentaje(valor: number): number {
    return Math.max(2, Math.round((valor / this.maximo) * 100));
  }
}
