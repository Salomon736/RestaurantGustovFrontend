import { Injectable } from '@angular/core';
import { SaleInterface } from '../../models/sale/sale.interface';
import { SalesByMenu } from '../../models/report/sales-report.interface';
import { ExportUtils } from '../../utils/report/export.utils';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToCSV(sales: SaleInterface[], filename: string = 'reporte-ventas.csv'): void {
    const csvContent = ExportUtils.salesToCSV(sales);
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  exportSalesByMenuToCSV(salesByMenu: SalesByMenu[], filename: string = 'reporte-productos.csv'): void {
    const csvContent = ExportUtils.salesByMenuToCSV(salesByMenu);
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  exportToJSON(data: any, filename: string = 'reporte.json'): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  exportToTXT(sales: SaleInterface[], filename: string = 'reporte-ventas.txt'): void {
    let txtContent = 'REPORTE DE VENTAS\n';
    txtContent += '================\n\n';

    sales.forEach(sale => {
      txtContent += `Fecha: ${new Date(sale.createdAt).toLocaleDateString('es-ES')}\n`;
      txtContent += `Hora: ${new Date(sale.createdAt).toLocaleTimeString('es-ES')}\n`;
      txtContent += `Producto: ${sale.menu.dish.name}\n`;
      txtContent += `Período: ${sale.menu.mealPeriod.nameMealPeriod}\n`;
      txtContent += `Cantidad: ${sale.quantitySold}\n`;
      txtContent += `Precio Unitario: Bs ${sale.menu.dish.price.toFixed(2)}\n`;
      txtContent += `Total: Bs ${sale.totalPrice.toFixed(2)}\n`;
      txtContent += '─'.repeat(40) + '\n\n';
    });

    const total = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    txtContent += `TOTAL GENERAL: Bs ${total.toFixed(2)}\n`;

    this.downloadFile(txtContent, filename, 'text/plain');
  }

  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
