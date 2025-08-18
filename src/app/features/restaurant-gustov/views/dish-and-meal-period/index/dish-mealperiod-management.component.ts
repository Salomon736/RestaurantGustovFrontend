import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DishService } from '../../../service/dish/dish.service';
import { DialogService } from 'src/app/dialog-component/dialog.service';
import { ToastService } from 'src/app/toast-notification/toast.service';
import { DishInterface } from '../../../models/dish/dish.interface';
import { filter, finalize, forkJoin, map, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { DishFormComponent } from '../dish-form/dish-form.component';
import { ApiResponseInterface } from 'src/app/models/api-response.interface';
import { ModalityDialogConfirmComponent } from 'src/app/dialog-confirm/modality-dialog-confirm.component';
import { MealPeriodInterface } from '../../../models/meal-period/meal-period.interface';
import { MealPeriodService } from '../../../service/meal-period/meal-period.service';
import { MealPeriodFormComponent } from '../meal-period-form/meal-period-form.component';

@Component({
  selector: 'app-dish-meal-period-management',
  templateUrl: './dish-meal-period-management.component.html'
})
export class DishMealPeriodManagementComponent {
  #dialogService = inject(DialogService);
  #toastService = inject(ToastService);

  #dishService = inject(DishService);
  #mealPeriodService = inject(MealPeriodService);

  #destroyRef = inject(DestroyRef);
  private destroy$ = new Subject<void>();
  activeTab: string = 'dishes';

  loading = signal(true);
  dishes = signal<DishInterface[]>([]);
  mealPeriods = signal<MealPeriodInterface[]>([]);

  constructor(private router: Router) {
    this.loading.set(true);
    forkJoin({
      dishes: this.#searchDishes$(),
      mealPeriods: this.#searchMealPeriods$()
    }).subscribe({
      next: ({ dishes, mealPeriods }) => {
        this.dishes.set(dishes.data);
        this.mealPeriods.set(mealPeriods.data);
        this.loading.set(false);
      },
      error: (e) => {
        console.log(e);
        this.loading.set(false);
      }
    });
  }
  openDishForm(existingDishId: number | null = null) {
    this.#dialogService.open(DishFormComponent, {
      size: {
        width: '600px'
      },
      data: {
        dishId: existingDishId
      }
    })
    .afterClosed()
    .pipe(
      switchMap((response: boolean) => {
        if (response) {
          return this.#searchDishes$().pipe(map(res => res.data));
        } else {
          return of(this.dishes());
        }
      })
    ).subscribe({
      next: (value) => {
        this.dishes.set(value);
        this.loading.set(false);
      },
      error: (e) => {
        console.log(e);
        this.loading.set(false);
      }
    });
  }
  openMealPeriodForm(existingMealPeriodId: number | null = null) {
    this.#dialogService.open(MealPeriodFormComponent, {
      size: {
        width: '600px'
      },
      data: {
        mealPeriodId: existingMealPeriodId
      }
    })
    .afterClosed()
    .pipe(
      switchMap((response: boolean) => {
        if (response) {
          return this.#searchMealPeriods$().pipe(map(res => res.data));
        } else {
          return of(this.mealPeriods());
        }
      })
    ).subscribe({
      next: (value) => {
        this.mealPeriods.set(value);
        this.loading.set(false);
      },
      error: (e) => {
        console.log(e);
        this.loading.set(false);
      }
    });
  }
  confirmDelete(id: number, type: "dish" | "mealPeriod") {
    console.log('ID PARA ELIMINAR: ',id)
    this.#dialogService
      .open(ModalityDialogConfirmComponent, {
        size: {
          width: "400px",
          minWidth: "350px",
          maxWidth: "95%",
          height: "auto",
          maxHeight: "80%",
        },
      })
      .afterClosed()
      .pipe(
        takeUntil(this.destroy$),
        filter((response) => response),
        switchMap(() => this.#deleteItemById$(id, type)),
      )
      .subscribe({
        next: (response: ApiResponseInterface<DishInterface[] | MealPeriodInterface[]>) => {
          if (response.isSuccess) {
            if (type === "dish") {
              this.dishes.set((response.data as DishInterface[]) || [])
            }else {
              this.mealPeriods.set((response.data as MealPeriodInterface[]) || [])
            }
            this.#toastService.open("Éxito", response.message, {
              duration: 2000,
              type: "delete",
            })
          } else {
            this.#toastService.open("Error", response.errors?.join(", "), {
              type: "error",
            })
          }
        },
        error: (e) => {
          console.error("Error al eliminar elemento", e)
          this.#toastService.open("Error", `No se puede eliminar el ${type} por que esta siendo usado en menu`, {
            type: "error",
          })
        },
      })
  }
  #deleteItemById$(
    id: number,
    type: "dish" | "mealPeriod",
  ): Observable<ApiResponseInterface<DishInterface[] | MealPeriodInterface[]>> {
    this.loading.set(true)

    if (type === "dish") {
      return this.#dishService.delete$(id, this.#destroyRef).pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false)),
        switchMap((deleteResponse) => {
          if (deleteResponse.isSuccess) {
            return this.#searchDishes$().pipe(
              map(
                (dishesResponse: ApiResponseInterface<DishInterface[]>) =>
                  ({
                    isSuccess: true,
                    data: dishesResponse.data || [],
                    statusCode: 200,
                    message: deleteResponse.message ||"Plato eliminado correctamente",
                    errors: [],
                  }) as ApiResponseInterface<DishInterface[]>,
              ),
            )
          } else {
            console.error("Error al eliminar plato")
            return of({
              isSuccess: false,
              data: this.dishes(),
              statusCode: deleteResponse.statusCode || 500,
              message: deleteResponse.message || "Error al eliminar plato",
              errors: deleteResponse.errors || [],
            } as ApiResponseInterface<DishInterface[]>)
          }
        }),
      )
    }
    else {
      return this.#mealPeriodService.delete$(id, this.#destroyRef).pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false)),
        switchMap((deleteResponse) => {
          if (deleteResponse.isSuccess) {
            return this.#searchMealPeriods$().pipe(
              map(
                (mealPeriodResponse: ApiResponseInterface<MealPeriodInterface[]>) =>
                  ({
                    isSuccess: true,
                    data: mealPeriodResponse.data || [],
                    statusCode: 200,
                    message: deleteResponse.message ||"Periodo de comida eliminado correctamente",
                    errors: [],
                  }) as ApiResponseInterface<MealPeriodInterface[]>,
              ),
            )
          } else {
            console.error("Error al eliminar plato")
            return of({
              isSuccess: false,
              data: this.mealPeriods(),
              statusCode: deleteResponse.statusCode || 500,
              message: deleteResponse.message || "Error al eliminar periodo de comida",
              errors: deleteResponse.errors || [],
            } as ApiResponseInterface<MealPeriodInterface[]>)
          }
        }),
      )
    }
  }
  #searchDishes$() {
    return this.#dishService.searchByFilter$();
  }
  #searchMealPeriods$() {
    return this.#mealPeriodService.searchByFilter$();
  }
  goBack() {
    this.router.navigate(['/']);
  }
}
