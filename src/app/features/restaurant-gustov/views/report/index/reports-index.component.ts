import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportFiltersComponent } from '../report-filter/report-filters.component';
import { SalesReportComponent } from '../sales-report/sales-report.component';
import { SalesSummaryComponent } from '../sales-summary/sales-summary.component';
import { ReportService } from '../../../service/report/report.service';
import { ExportService } from '../../../service/report/export.service';
import { ReportFilter } from '../../../models/report/report-filter.interface';
import { SaleInterface } from '../../../models/sale/sale.interface';
import { SalesByMenu } from '../../../models/report/sales-report.interface';

@Component({
  selector: 'app-reports',
  templateUrl: './reports-index.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReportFiltersComponent,
    SalesReportComponent,
    SalesSummaryComponent
  ]
})
export class ReportsComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly exportService = inject(ExportService);

  loading = signal<boolean>(false);
  currentView = signal<'detailed' | 'summary' | 'analytical'>('detailed');

  salesData = signal<SaleInterface[]>([]);
  salesByMenuData = signal<SalesByMenu[]>([]);

  currentFilters = signal<ReportFilter>({
    startDate: null,
    endDate: null,
    specificDate: new Date(),
    menuId: null,
    mealPeriodId: null,
    reportType: 'detailed'
  });

  totalRevenue = signal<number>(0);
  totalItemsSold = signal<number>(0);

  ngOnInit(): void {
    this.loadReport(this.currentFilters());
  }

  onFiltersChange(filters: ReportFilter): void {
    this.currentFilters.set(filters);
    this.currentView.set(filters.reportType);
    this.loadReport(filters);
  }

  loadReport(filters: ReportFilter): void {
    this.loading.set(true);

    switch (filters.reportType) {
      case 'detailed':
        this.loadDetailedReport(filters);
        break;
      case 'summary':
        this.loadSummaryReport(filters);
        break;
      case 'analytical':
        this.loadAnalyticalReport(filters);
        break;
    }
  }

  private loadDetailedReport(filters: ReportFilter): void {
    this.reportService.generateSalesReport(filters).subscribe({
      next: (report) => {
        this.salesData.set(report.sales);
        this.totalRevenue.set(report.totalRevenue);
        this.totalItemsSold.set(report.totalItemsSold);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading detailed report:', error);
        this.salesData.set([]);
        this.loading.set(false);
      }
    });
  }

  private loadSummaryReport(filters: ReportFilter): void {
    this.reportService.getSalesByMenuReport(filters).subscribe({
      next: (salesByMenu) => {
        this.salesByMenuData.set(salesByMenu);
        this.totalRevenue.set(salesByMenu.reduce((sum, item) => sum + item.totalRevenue, 0));
        this.totalItemsSold.set(salesByMenu.reduce((sum, item) => sum + item.totalSold, 0));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading summary report:', error);
        this.salesByMenuData.set([]);
        this.loading.set(false);
      }
    });
  }

  private loadAnalyticalReport(filters: ReportFilter): void {
    this.loadDetailedReport(filters);
  }
  exportCurrentView(): void {
    const timestamp = new Date().toISOString().split('T')[0];

    switch (this.currentView()) {
      case 'detailed':
        this.exportService.exportToCSV(
          this.salesData(),
          `reporte-detallado-${timestamp}.csv`
        );
        break;
      case 'summary':
        this.exportService.exportSalesByMenuToCSV(
          this.salesByMenuData(),
          `reporte-resumen-${timestamp}.csv`
        );
        break;
      case 'analytical':
        this.exportService.exportToCSV(
          this.salesData(),
          `reporte-analitico-${timestamp}.csv`
        );
        break;
    }
  }

  getReportTitle(): string {
    const filters = this.currentFilters();

    if (filters.specificDate) {
      return `Reporte del ${filters.specificDate.toLocaleDateString('es-ES')}`;
    } else if (filters.startDate && filters.endDate) {
      return `Reporte del ${filters.startDate.toLocaleDateString('es-ES')} al ${filters.endDate.toLocaleDateString('es-ES')}`;
    } else if (filters.menuId) {
      return 'Reporte por Menú Específico';
    } else if (filters.mealPeriodId) {
      return 'Reporte por Período de Comida';
    }

    return 'Reporte de Ventas';
  }

  getActiveReportType(): string {
    switch (this.currentView()) {
      case 'detailed': return 'Detallado';
      case 'summary': return 'Resumen por Producto';
      case 'analytical': return 'Análisis';
      default: return 'Reporte';
    }
  }
}
