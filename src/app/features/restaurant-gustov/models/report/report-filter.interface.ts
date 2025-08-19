export interface ReportFilter {
  startDate: Date | null;
  endDate: Date | null;
  specificDate: Date | null;
  menuId: number | null;
  mealPeriodId: number | null;
  reportType: 'detailed' | 'summary' | 'analytical';
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ReportTypeOption {
  value: string;
  label: string;
  description: string;
}
