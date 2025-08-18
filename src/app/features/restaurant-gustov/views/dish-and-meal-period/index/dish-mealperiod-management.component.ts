import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DishService } from '../../../service/dish/dish.service';
import { DialogService } from 'src/app/dialog-component/dialog.service';
import { ToastService } from 'src/app/toast-notification/toast.service';
import { DishInterface } from '../../../models/dish/dish.interface';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dish-meal-period-management',
  templateUrl: './dish-meal-period-management.component.html'
})
export class DishMealPeriodManagementComponent {
  #dialogService = inject(DialogService);
  #dishService = inject(DishService);
  #destroyRef = inject(DestroyRef);
  #toastService = inject(ToastService);
  activeTab: string = 'dishes';

  loading = signal(true);
  dishes = signal<DishInterface[]>([]);

  constructor(private router: Router) {
    this.loading.set(true);
    forkJoin({
      dishes: this.#searchDishes$()
    }).subscribe({
      next: ({ dishes }) => {
        this.dishes.set(dishes.data);
        this.loading.set(false);
      },
      error: (e) => {
        console.log(e);
        this.loading.set(false);
      }
    });
  }
  #searchDishes$() {
    return this.#dishService.searchByFilter$();
  }
  goBack() {
    this.router.navigate(['/']);
  }
}
