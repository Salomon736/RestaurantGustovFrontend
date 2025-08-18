import { Component, DestroyRef, inject, signal, LOCALE_ID  } from '@angular/core';
import { CommonModule, registerLocaleData  } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Router } from '@angular/router';
import { MenuService } from '../../../service/menu/menu.service';
import { DishService } from '../../../service/dish/dish.service';
import { MealPeriodService } from '../../../service/meal-period/meal-period.service';
import { ToastService } from 'src/app/toast-notification/toast.service';
import { DialogService } from 'src/app/dialog-component/dialog.service';
import { MenuInterface } from '../../../models/menu/menu.interface';
import { DishInterface } from '../../../models/dish/dish.interface';
import { MealPeriodInterface } from '../../../models/meal-period/meal-period.interface';
import { MenuFormModel } from '../../../models/menu/menu-form.model';
import { forkJoin, Subject, switchMap, takeUntil, finalize, of, map } from 'rxjs';
import { ModalityDialogConfirmComponent } from 'src/app/dialog-confirm/modality-dialog-confirm.component';
registerLocaleData(localeEs);

@Component({
  selector: 'app-menu-management',
  templateUrl: './menu-index.component.html',
    providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ]
})
export class MenuManagementComponent {
  #menuService = inject(MenuService);
  #dishService = inject(DishService);
  #mealPeriodService = inject(MealPeriodService);
  #toastService = inject(ToastService);
  #dialogService = inject(DialogService);
  #destroyRef = inject(DestroyRef);

  private destroy$ = new Subject<void>();

  loading = signal(true);
  menus = signal<MenuInterface[]>([]);
  dishes = signal<DishInterface[]>([]);
  mealPeriods = signal<MealPeriodInterface[]>([]);

  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  selectedMealPeriod = signal<number | null>(null);

  constructor(private router: Router) {
    this.loadInitialData();
  }

  loadInitialData() {
    this.loading.set(true);
    forkJoin({
      menus: this.#menuService.searchByFilter$(),
      dishes: this.#dishService.searchByFilter$(),
      mealPeriods: this.#mealPeriodService.searchByFilter$()
    }).subscribe({
      next: ({ menus, dishes, mealPeriods }) => {
        this.menus.set(menus.data || []);
        this.dishes.set(dishes.data || []);
        this.mealPeriods.set(mealPeriods.data || []);
        this.loading.set(false);
      },
      error: (e) => {
        console.error(e);
        this.loading.set(false);
      }
    });
  }

  onDateChange(event: any) {
    this.selectedDate.set(event.target.value);
  }

  onMealPeriodChange(mealPeriodId: number) {
    this.selectedMealPeriod.set(mealPeriodId);
  }

  addDishToMenu(dishId: number, quantity: number = 1) {
    if (!this.selectedMealPeriod()) {
      this.#toastService.open("Error", "Selecciona un período de comida primero", {
        type: "error"
      });
      return;
    }

    const menuData = new MenuFormModel(
      this.selectedDate(),
      quantity,
      dishId,
      this.selectedMealPeriod()
    );

    this.#menuService.save$(menuData).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.loadInitialData();
          this.#toastService.open("Éxito", "Plato agregado al menú correctamente", {
            type: "success",
            duration: 2000
          });
        } else {
          this.#toastService.open("Error", response.errors?.join(", ") || "Error desconocido", {
            type: "error"
          });
        }
      },
      error: (e) => {
        console.error(e);
        this.#toastService.open("Error", "Error al agregar plato al menú", {
          type: "error"
        });
      }
    });
  }
  updateMenuQuantity(menuId: number, newQuantity: number) {
    newQuantity = Math.max(1, Math.min(100, newQuantity));

    const menu = this.menus().find(m => m.id === menuId);
    if (!menu) return;

    const menuData = new MenuFormModel(
      menu.menuDate.toString().split('T')[0],
      newQuantity,
      menu.idDish,
      menu.idMealPeriod
    );
    this.#menuService.save$(menuData, menuId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          const updatedMenus = this.menus().map(m =>
            m.id === menuId ? { ...m, quantity: newQuantity } : m
          );
          this.menus.set(updatedMenus);
          this.loadInitialData();
          this.#toastService.open("Éxito", "Cantidad actualizada", {
            type: "success",
            duration: 1500
          });
        }
      },
      error: (e) => {
        console.error(e);
        this.loadInitialData();
      }
    });
}

  removeFromMenu(menuId: number) {
    this.#dialogService
      .open(ModalityDialogConfirmComponent, {
        size: { width: "400px" }
      })
      .afterClosed()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((confirmed) => {
          if (confirmed) {
            return this.#menuService.delete$(menuId, this.#destroyRef);
          }
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.isSuccess) {
            this.loadInitialData();
            this.#toastService.open("Éxito", "Plato removido del menú", {
              type: "delete",
              duration: 2000
            });
          }
        },
        error: (e) => {
          console.error(e);
          this.#toastService.open("Error", "Error al remover plato del menú", {
            type: "error"
          });
        }
      });
  }

  getMenusForSelectedDateAndPeriod(): MenuInterface[] {
    return this.menus().filter(menu => {
      const menuDate = new Date(menu.menuDate).toISOString().split('T')[0];
      return menuDate === this.selectedDate() &&
             (!this.selectedMealPeriod() || menu.idMealPeriod === this.selectedMealPeriod());
    });
  }

  getAvailableDishes(): DishInterface[] {
    const menusForPeriod = this.getMenusForSelectedDateAndPeriod();
    const usedDishIds = menusForPeriod.map(menu => menu.idDish);
    return this.dishes().filter(dish => !usedDishIds.includes(dish.id));
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
