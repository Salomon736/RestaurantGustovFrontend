import { SaleInterface } from "../sale/sale.interface";
import { MenuInterface } from "../menu/menu.interface";

export interface SalesReport {
  sales: SaleInterface[];
  totalRevenue: number;
  totalItemsSold: number;
  averageSale: number;
  period: string;
}

export interface SalesByMenu {
  menu: MenuInterface;
  totalSold: number;
  totalRevenue: number;
  percentage: number;
}

export interface SalesByPeriod {
  period: string;
  periodName: string;
  color: string;
  totalRevenue: number;
  totalSales: number;
}
