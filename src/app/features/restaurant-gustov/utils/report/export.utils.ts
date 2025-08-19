import { SaleInterface } from '../../models/sale/sale.interface';
import { SalesByMenu, SalesByPeriod } from '../../models/report/sales-report.interface';

export class ExportUtils {
  static salesToCSV(sales: SaleInterface[]): string {
    const headers = ['Fecha', 'Hora', 'Producto', 'Período', 'Cantidad', 'Precio Unitario', 'Total', 'Menú ID'];
    const rows = sales.map(sale => [
      new Date(sale.createdAt).toLocaleDateString('es-ES'),
      new Date(sale.createdAt).toLocaleTimeString('es-ES'),
      sale.menu.dish.name,
      sale.menu.mealPeriod.nameMealPeriod,
      sale.quantitySold.toString(),
      `Bs ${sale.menu.dish.price.toFixed(2)}`,
      `Bs ${sale.totalPrice.toFixed(2)}`,
      sale.idMenu.toString()
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  static salesByMenuToCSV(salesByMenu: SalesByMenu[]): string {
    const headers = ['Producto', 'Período', 'Cantidad Vendida', 'Ingreso Total', 'Porcentaje'];
    const rows = salesByMenu.map(item => [
      item.menu.dish.name,
      item.menu.mealPeriod.nameMealPeriod,
      item.totalSold.toString(),
      `Bs ${item.totalRevenue.toFixed(2)}`,
      `${item.percentage.toFixed(1)}%`
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  static formatCurrency(amount: number): string {
    return `Bs ${amount.toFixed(2)}`;
  }
}
