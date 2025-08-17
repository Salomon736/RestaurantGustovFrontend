import { Component } from '@angular/core';

@Component({
  selector: 'app-dish-meal-period-management',
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="border-b border-gray-200 bg-white shadow-sm">
        <div class="container mx-auto px-4 py-6">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900">Gestión de Menú</h1>
            <button
              class="text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              (click)="goBack()">
              ← Volver
            </button>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <div class="flex space-x-1 bg-white border border-gray-200 p-1 rounded-lg w-fit shadow-sm">
            <button
              (click)="activeTab = 'dishes'"
              [class]="activeTab === 'dishes'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
              class="px-6 py-3 rounded-md transition-all duration-200 font-medium">
              🍽️ Platos
            </button>
            <button
              (click)="activeTab = 'meal-periods'"
              [class]="activeTab === 'meal-periods'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
              class="px-6 py-3 rounded-md transition-all duration-200 font-medium">
              ⏰ Períodos de Comida
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div *ngIf="activeTab === 'dishes'" class="p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Gestión de Platos</h2>
              <button class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                + Nuevo Plato
              </button>
            </div>
            <div class="text-center py-12 text-gray-500">
              <div class="text-4xl mb-4">🍽️</div>
              <p class="text-lg">No hay platos registrados</p>
              <p class="text-sm">Comienza agregando tu primer plato</p>
            </div>
          </div>

          <div *ngIf="activeTab === 'meal-periods'" class="p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Períodos de Comida</h2>
              <button class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                + Nuevo Período
              </button>
            </div>
            <div class="text-center py-12 text-gray-500">
              <div class="text-4xl mb-4">⏰</div>
              <p class="text-lg">No hay períodos configurados</p>
              <p class="text-sm">Define los horarios de comida (desayuno, almuerzo, cena)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class DishMealPeriodManagementComponent {
  activeTab: string = 'dishes';

  goBack() {
    window.history.back();
  }
}
