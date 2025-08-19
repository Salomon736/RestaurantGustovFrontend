import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DishMealPeriodManagementComponent } from './features/restaurant-gustov/views/dish-and-meal-period/index/dish-mealperiod-management.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { MenuManagementComponent } from './features/restaurant-gustov/views/menu/index/menu-index.component';
import { SaleManagementComponent } from './features/restaurant-gustov/views/sale/index/sale-index-management.component';
import { ReportsComponent } from './features/restaurant-gustov/views/report/index/reports-index.component';
import { ReportService } from './features/restaurant-gustov/service/report/report.service';
import { ExportService } from './features/restaurant-gustov/service/report/export.service';
import { CommonModule } from '@angular/common';
import { ReportFiltersComponent } from './features/restaurant-gustov/views/report/report-filter/report-filters.component';
import { SalesReportComponent } from './features/restaurant-gustov/views/report/sales-report/sales-report.component';
import { SalesSummaryComponent } from './features/restaurant-gustov/views/report/sales-summary/sales-summary.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DishMealPeriodManagementComponent,
    MenuManagementComponent,
    SaleManagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    ReportsComponent,
    ReportFiltersComponent,
    SalesReportComponent,
    SalesSummaryComponent
  ],
  providers: [
    ReportService,
    ExportService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
