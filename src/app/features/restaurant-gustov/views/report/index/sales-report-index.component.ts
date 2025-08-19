import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleInterface } from '../../../models/sale/sale.interface';
import { ExportService } from '../../../service/report/export.service';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report-index.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class SalesReportComponent {
  private readonly exportService = inject(ExportService);

  @Input() sales = signal<SaleInterface[]>([]);
  @Input() title = signal<string>('Reporte de Ventas');
  @Input() loading = signal<boolean>(false);

  get totalRevenue(): number {
    return this.sales().reduce((sum, sale) => sum + sale.totalPrice, 0);
  }

  get totalItemsSold(): number {
    return this.sales().reduce((sum, sale) => sum + sale.quantitySold, 0);
  }

  get averageSale(): number {
    return this.totalItemsSold > 0 ? this.totalRevenue / this.totalItemsSold : 0;
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.sales(), `reporte-ventas-${new Date().toISOString().split('T')[0]}.csv`);
  }

  exportToTXT(): void {
    this.exportService.exportToTXT(this.sales(), `reporte-ventas-${new Date().toISOString().split('T')[0]}.txt`);
  }

  exportToJSON(): void {
    this.exportService.exportToJSON(this.sales(), `reporte-ventas-${new Date().toISOString().split('T')[0]}.json`);
  }
}
