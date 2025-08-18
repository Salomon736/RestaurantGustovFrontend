import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DishMealPeriodManagementComponent } from './features/restaurant-gustov/views/dish-and-meal-period/index/dish-mealperiod-management.component';
import { HomeComponent } from './home/home.component';
import { MenuManagementComponent } from './features/restaurant-gustov/views/menu/index/menu-index.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dish-meal-period-management', component: DishMealPeriodManagementComponent },
  { path: 'menu-management', component: MenuManagementComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
