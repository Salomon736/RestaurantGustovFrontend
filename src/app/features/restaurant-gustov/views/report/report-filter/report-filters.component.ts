import { Component, EventEmitter, Output, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MealPeriodService } from '../../../service/meal-period/meal-period.service';
import { MenuService } from '../../../service/menu/menu.service';
import { ReportFilter } from '../../../models/report/report-filter.interface';
import { MealPeriodInterface } from '../../../models/meal-period/meal-period.interface';
import { MenuInterface } from '../../../models/menu/menu.interface';
import { REPORT_TYPES } from '../../../constants/report/report.constants';

interface ReportTypeOption {
  value: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-report-filters',
  templateUrl: './report-filters.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ReportFiltersComponent implements OnInit {
  private readonly mealPeriodService = inject(MealPeriodService);
  private readonly menuService = inject(MenuService);

  @Output() filtersChange = new EventEmitter<ReportFilter>();

  filters = signal<ReportFilter>({
    startDate: null,
    endDate: null,
    specificDate: new Date(),
    menuId: null,
    mealPeriodId: null,
    reportType: 'detailed'
  });

  mealPeriods = signal<MealPeriodInterface[]>([]);
  menus = signal<MenuInterface[]>([]);
  reportTypes: ReportTypeOption[] = [
    REPORT_TYPES.DETAILED,
    REPORT_TYPES.SUMMARY,
    REPORT_TYPES.ANALYTICAL
  ];

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.mealPeriodService.searchByFilter$().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.mealPeriods.set(response.data || []);
        }
      },
      error: (error) => console.error('Error loading meal periods:', error)
    });

    this.menuService.searchByFilter$().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.menus.set(response.data || []);
        }
      },
      error: (error) => console.error('Error loading menus:', error)
    });
  }

  onFilterChange(): void {
    this.filtersChange.emit(this.filters());
  }

  onDateTypeChange(useRange: boolean): void {
    const currentFilters = this.filters();
    const newFilters: ReportFilter = {
      ...currentFilters,
      startDate: useRange ? new Date() : null,
      endDate: useRange ? new Date() : null,
      specificDate: useRange ? null : new Date()
    };
    this.filters.set(newFilters);
    this.onFilterChange();
  }

  onReportTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newFilters: ReportFilter = {
      ...this.filters(),
      reportType: select.value as 'detailed' | 'summary' | 'analytical'
    };
    this.filters.set(newFilters);
    this.onFilterChange();
  }

  onSpecificDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newFilters: ReportFilter = {
      ...this.filters(),
      specificDate: new Date(input.value)
    };
    this.filters.set(newFilters);
    this.onFilterChange();
  }

  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newFilters: ReportFilter = {
      ...this.filters(),
      startDate: new Date(input.value)
    };
    this.filters.set(newFilters);
    this.onFilterChange();
  }

  onEndDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newFilters: ReportFilter = {
      ...this.filters(),
      endDate: new Date(input.value)
    };
    this.filters.set(newFilters);
    this.onFilterChange();
  }

  onMealPeriodChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value ? parseInt(select.value) : null;
    const newFilters: ReportFilter = {
      ...this.filters(),
      mealPeriodId: value
    };
    this.filters.set(newFilters);
    this.onFilterChange();
  }

  onMenuChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value ? parseInt(select.value) : null;
    const newFilters: ReportFilter = {
      ...this.filters(),
      menuId: value
    };
    this.filters.set(newFilters);
    this.onFilterChange();
  }

  clearFilters(): void {
    const newFilters: ReportFilter = {
      startDate: null,
      endDate: null,
      specificDate: new Date(),
      menuId: null,
      mealPeriodId: null,
      reportType: 'detailed'
    };
    this.filters.set(newFilters);
    this.onFilterChange();
  }

  isRangeSelected(): boolean {
    return this.filters().startDate !== null;
  }

  getSelectedReportType(): ReportTypeOption {
    return this.reportTypes.find(type => type.value === this.filters().reportType) || this.reportTypes[0];
  }
}
