import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DishService } from '../../../service/dish/dish.service';
import { DialogService } from 'src/app/service/disalog.service';

@Component({
  selector: 'app-dish-meal-period-management',
  templateUrl: './dish-meal-period-management.component.html'
})
export class DishMealPeriodManagementComponent {
  #dialogService = inject(DialogService);
  #dishService = inject(DishService);
  activeTab: string = 'dishes';

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}
