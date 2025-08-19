import { DateRange } from "../../models/report/report-filter.interface";

export class DateUtils {
  static formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static getDateRangeLabel(start: Date, end: Date): string {
    if (this.isSameDay(start, end)) {
      return start.toLocaleDateString('es-ES');
    }
    return `${start.toLocaleDateString('es-ES')} - ${end.toLocaleDateString('es-ES')}`;
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  static getDaysInRange(start: Date, end: Date): number {
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  static getLast7Days(): DateRange {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start, end };
  }

  static getCurrentMonth(): DateRange {
    const start = new Date();
    start.setDate(1);
    const end = new Date();
    return { start, end };
  }
}
