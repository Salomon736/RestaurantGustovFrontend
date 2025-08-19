import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesByMenu } from '../../../models/report/sales-report.interface';
import { ExportService } from '../../../service/report/export.service';

@Component({
  selector: 'app-sales-summary',
  templateUrl: './sales-summary.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class SalesSummaryComponent {
  private readonly exportService = inject(ExportService);

  @Input() salesByMenu = signal<SalesByMenu[]>([]);
  @Input() title = signal<string>('Resumen por Producto');
  @Input() loading = signal<boolean>(false);

  get totalRevenue(): number {
    return this.salesByMenu().reduce((sum, item) => sum + item.totalRevenue, 0);
  }

  get totalItemsSold(): number {
    return this.salesByMenu().reduce((sum, item) => sum + item.totalSold, 0);
  }

  exportToCSV(): void {
    this.exportService.exportSalesByMenuToCSV(
      this.salesByMenu(),
      `resumen-productos-${new Date().toISOString().split('T')[0]}.csv`
    );
  }

  exportToJSON(): void {
    this.exportService.exportToJSON(
      this.salesByMenu(),
      `resumen-productos-${new Date().toISOString().split('T')[0]}.json`
    );
  }
}
