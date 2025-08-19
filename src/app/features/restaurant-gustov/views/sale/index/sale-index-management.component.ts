import { Component, DestroyRef, inject, signal, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SaleService } from '../../../service/sale/sale.service';
import { MenuService } from '../../../service/menu/menu.service';
import { ToastService } from 'src/app/toast-notification/toast.service';
import { DialogService } from 'src/app/dialog-component/dialog.service';
import { SaleInterface } from '../../../models/sale/sale.interface';
import { MenuInterface } from '../../../models/menu/menu.interface';
import { SaleFormModel } from '../../../models/sale/sale-form.model';
import { forkJoin, Subject, switchMap, takeUntil, finalize, of } from 'rxjs';
import { ModalityDialogConfirmComponent } from 'src/app/dialog-confirm/modality-dialog-confirm.component';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

registerLocaleData(localeEs);

@Component({
  selector: 'app-sale-management',
  templateUrl: './sale-index-management.component.html',
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ]
})
export class SaleManagementComponent {
  #saleService = inject(SaleService);
  #menuService = inject(MenuService);
  #toastService = inject(ToastService);
  #dialogService = inject(DialogService);
  #destroyRef = inject(DestroyRef);

  loading = signal(true);
  sales = signal<SaleInterface[]>([]);
  menus = signal<MenuInterface[]>([]);
  filteredMenus = signal<MenuInterface[]>([]);

  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  selectedMenu = signal<number | null>(null);
  quantity = signal<number>(1);

  constructor(private router: Router) {
    this.loadInitialData();
  }

  loadInitialData() {
    this.loading.set(true);
    forkJoin({
      sales: this.#saleService.searchByFilter$(),
      menus: this.#menuService.searchByFilter$()
    }).subscribe({
      next: ({ sales, menus }) => {
        this.sales.set(sales.data || []);
        this.menus.set(menus.data || []);
        this.filterMenusByDate();
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
    this.filterMenusByDate();
  }

  onMenuChange(menuId: number) {
    this.selectedMenu.set(menuId);
    this.updateTotalPrice();
  }

  onQuantityChange(quantity: number) {
    this.quantity.set(Math.max(1, quantity));
    this.updateTotalPrice();
  }

  updateTotalPrice() {
    const menu = this.menus().find(m => m.id === this.selectedMenu());
    if (menu && menu.dish) {
      const totalPrice = menu.dish.price * this.quantity();
    }
  }

  filterMenusByDate() {
    const filtered = this.menus().filter(menu => {
      const menuDate = new Date(menu.menuDate).toISOString().split('T')[0];
      return menuDate === this.selectedDate() && menu.quantity > 0;
    });
    this.filteredMenus.set(filtered);
  }

  registerSale() {
    if (!this.selectedMenu()) {
      this.#toastService.open("Error", "Selecciona un menú primero", {
        type: "error"
      });
      return;
    }

    const menu = this.menus().find(m => m.id === this.selectedMenu());
    if (!menu) return;

    if (this.quantity() > menu.quantity) {
      this.#toastService.open("Error", `Stock insuficiente. Disponible: ${menu.quantity}`, {
        type: "error"
      });
      return;
    }

    const totalPrice = menu.dish ? menu.dish.price * this.quantity() : 0;
    const saleData = new SaleFormModel(
      this.selectedMenu()!,
      this.quantity(),
      totalPrice
    );

    this.#saleService.save$(saleData).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.loadInitialData();
          this.#toastService.open("Éxito", "Venta registrada correctamente", {
            type: "success",
            duration: 2000
          });
          this.resetForm();
        } else {
          this.#toastService.open("Error", response.errors?.join(", ") || "Error al registrar venta", {
            type: "error"
          });
        }
      },
      error: (e) => {
        console.error(e);
        this.#toastService.open("Error", "Error al registrar venta", {
          type: "error"
        });
      }
    });
  }

  deleteSale(saleId: number) {
    this.#dialogService
      .open(ModalityDialogConfirmComponent, {
        size: { width: "400px" }
      })
      .afterClosed()
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        switchMap((confirmed) => {
          if (confirmed) {
            return this.#saleService.delete$(saleId, this.#destroyRef);
          }
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.isSuccess) {
            this.loadInitialData();
            this.#toastService.open("Éxito", "Venta eliminada", {
              type: "delete",
              duration: 2000
            });
          }
        },
        error: (e) => {
          console.error(e);
          this.#toastService.open("Error", "Error al eliminar venta", {
            type: "error"
          });
        }
      });
  }

  resetForm() {
    this.selectedMenu.set(null);
    this.quantity.set(1);
  }

  getSalesForSelectedDate(): SaleInterface[] {
    return this.sales().filter(sale => {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      return saleDate === this.selectedDate();
    });
  }
  getTotalSalesForDay(): number {
    return this.getSalesForSelectedDate().reduce((total, sale) => total + sale.totalPrice, 0);
  }
  getSelectedMenuPrice(): number {
    if (!this.selectedMenu()) return 0;
    const menu = this.menus().find(m => m.id === this.selectedMenu());
    return menu?.dish?.price || 0;
  }
  getSelectedMenuQuantity(): number {
    if (!this.selectedMenu()) return 0;
    const menu = this.menus().find(m => m.id === this.selectedMenu());
    return menu?.quantity || 0;
  }
  selectMenu(menu: MenuInterface): void {
    this.selectedMenu.set(menu.id);
    this.quantity.set(1);
  }

  getSelectedMenu(): MenuInterface | undefined {
    return this.menus().find(m => m.id === this.selectedMenu());
  }

  increaseQuantity(): void {
    if (this.quantity() < this.getSelectedMenuQuantity()) {
      this.quantity.update(q => q + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }
  groupMenusByPeriod(): any[] {
    const periodsMap = new Map<number, any>();

    this.filteredMenus().forEach(menu => {
      if (!periodsMap.has(menu.idMealPeriod)) {
        periodsMap.set(menu.idMealPeriod, {
          id: menu.mealPeriod.id,
          name: menu.mealPeriod.nameMealPeriod,
          color: menu.mealPeriod.color,
          startTime: menu.mealPeriod.startTime,
          endTime: menu.mealPeriod.endTime,
          menus: []
        });
      }
      periodsMap.get(menu.idMealPeriod).menus.push(menu);
    });

    return Array.from(periodsMap.values());
  }
  goBack() {
    this.router.navigate(['/']);
  }
}
