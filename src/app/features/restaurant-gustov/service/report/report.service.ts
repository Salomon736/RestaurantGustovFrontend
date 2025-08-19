import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ApiResponseInterface } from 'src/app/models/api-response.interface';
import { SaleInterface } from '../../models/sale/sale.interface';
import { MenuInterface } from '../../models/menu/menu.interface';
import { ReportFilter } from '../../models/report/report-filter.interface';
import { DateUtils } from '../../utils/report/date.utils';
import { SalesByMenu, SalesReport } from '../../models/report/sales-report.interface';
import { MealPeriodService } from '../meal-period/meal-period.service';
import { MealPeriodInterface } from '../../models/meal-period/meal-period.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiRestaurant}/sale`;
  private readonly mealPeriodService = inject(MealPeriodService);
  private mealPeriods: MealPeriodInterface[] = [];
  constructor() {
    this.loadMealPeriods();
  }

  private loadMealPeriods(): void {
    this.mealPeriodService.searchByFilter$().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.mealPeriods = response.data || [];
        }
      },
      error: (error) => console.error('Error loading meal periods:', error)
    });
  }

  //#region Métodos Base para Endpoints API

  getSalesByDate$(date: Date): Observable<SaleInterface[]> {
    return this.http.get<ApiResponseInterface<SaleInterface[]>>(
      `${this.baseUrl}/date/${DateUtils.formatDateForApi(date)}`
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching sales by date:', error);
        return of([]);
      })
    );
  }

  getSalesByDateRange$(startDate: Date, endDate: Date): Observable<SaleInterface[]> {
    return this.http.get<ApiResponseInterface<SaleInterface[]>>(
      `${this.baseUrl}/date-range/${
        DateUtils.formatDateForApi(startDate)
      }/${
        DateUtils.formatDateForApi(endDate)
      }`
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching sales by date range:', error);
        return of([]);
      })
    );
  }


  getTotalSalesByDate$(date: Date): Observable<number> {
    return this.http.get<ApiResponseInterface<number>>(
      `${this.baseUrl}/total/date/${DateUtils.formatDateForApi(date)}`
    ).pipe(
      map(response => response.data || 0),
      catchError(error => {
        console.error('Error fetching total sales by date:', error);
        return of(0);
      })
    );
  }

  getTotalSalesByDateRange$(startDate: Date, endDate: Date): Observable<number> {
    return this.http.get<ApiResponseInterface<number>>(
      `${this.baseUrl}/total/date-range/${
        DateUtils.formatDateForApi(startDate)
      }/${
        DateUtils.formatDateForApi(endDate)
      }`
    ).pipe(
      map(response => response.data || 0),
      catchError(error => {
        console.error('Error fetching total sales by date range:', error);
        return of(0);
      })
    );
  }

  //#endregion

  //#region Métodos de Alto Nivel para Reportes

  generateSalesReport(filters: ReportFilter): Observable<SalesReport> {
    return this.getFilteredSales$(filters).pipe(
      switchMap(sales => {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
        const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
        const averageSale = totalItemsSold > 0 ? totalRevenue / totalItemsSold : 0;

        const period = this.getReportPeriodLabel(filters);

        return of({
          sales,
          totalRevenue,
          totalItemsSold,
          averageSale,
          period
        });
      })
    );
  }

  getSalesByMenuReport(filters: ReportFilter): Observable<SalesByMenu[]> {
    return this.getFilteredSales$(filters).pipe(
      map(sales => {
        const menuMap = new Map<number, SalesByMenu>();
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);

        sales.forEach(sale => {
          if (!menuMap.has(sale.idMenu)) {
            menuMap.set(sale.idMenu, {
              menu: sale.menu,
              totalSold: 0,
              totalRevenue: 0,
              percentage: 0
            });
          }

          const menuData = menuMap.get(sale.idMenu)!;
          menuData.totalSold += sale.quantitySold;
          menuData.totalRevenue += sale.totalPrice;
        });

        const result = Array.from(menuMap.values());
        result.forEach(item => {
          item.percentage = totalRevenue > 0 ? (item.totalRevenue / totalRevenue) * 100 : 0;
        });

        return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
      })
    );
  }

  //#endregion

  //#region Métodos Privados de Utilidad

  private getFilteredSales$(filters: ReportFilter): Observable<SaleInterface[]> {
    if (filters.mealPeriodId) {
      return this.getSalesByMealPeriod$(filters.mealPeriodId, filters.startDate || undefined, filters.endDate || undefined);
    }
    if (filters.specificDate) {
      return this.getSalesByDate$(filters.specificDate);
    }
    if (filters.startDate && filters.endDate) {
      return this.getSalesByDateRange$(filters.startDate, filters.endDate);
    }
    const { start, end } = DateUtils.getCurrentMonth();
    return this.getSalesByDateRange$(start, end);
  }

  private getReportPeriodLabel(filters: ReportFilter): string {
    if (filters.mealPeriodId && filters.startDate && filters.endDate) {
      const period = this.mealPeriods.find(p => p.id === filters.mealPeriodId);
      const periodName = period ? period.nameMealPeriod : 'Período';
      return `${periodName} (${DateUtils.getDateRangeLabel(filters.startDate, filters.endDate)})`;
    }

    if (filters.mealPeriodId) {
      const period = this.mealPeriods.find(p => p.id === filters.mealPeriodId);
      return period ? period.nameMealPeriod : 'Período Específico';
    }

    if (filters.specificDate) {
      return DateUtils.getDateRangeLabel(filters.specificDate, filters.specificDate);
    }

    if (filters.startDate && filters.endDate) {
      return DateUtils.getDateRangeLabel(filters.startDate, filters.endDate);
    }

    const { start, end } = DateUtils.getCurrentMonth();
    return DateUtils.getDateRangeLabel(start, end);
  }
  getSalesByMealPeriod$(idMealPeriod: number, startDate?: Date, endDate?: Date): Observable<SaleInterface[]> {
    let url = `${this.baseUrl}/meal-period/${idMealPeriod}`;

    if (startDate && endDate) {
      url += `?startDate=${DateUtils.formatDateForApi(startDate)}&endDate=${DateUtils.formatDateForApi(endDate)}`;
    } else if (startDate) {
      url += `?startDate=${DateUtils.formatDateForApi(startDate)}`;
    } else if (endDate) {
      url += `?endDate=${DateUtils.formatDateForApi(endDate)}`;
    }

    return this.http.get<ApiResponseInterface<SaleInterface[]>>(url).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching sales by meal period:', error);
        return of([]);
      })
    );
  }

  //#endregion
}
