import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dish-meal-period-management',
  templateUrl: './dish-meal-period-management.component.html'
})
export class DishMealPeriodManagementComponent {
  activeTab: string = 'dishes';

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}
