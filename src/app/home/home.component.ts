import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToDishAndMealPeriodManagement() {
    this.router.navigate(['/dish-meal-period-management']);
  }
  navigateToMenuManagement() {
    this.router.navigate(['/menu-management']);
  }
  navigateToSaleManagement() {
    this.router.navigate(['/sale-management']);
  }
  navigateToReportManagement() {
    this.router.navigate(['/report-management']);
  }
}
