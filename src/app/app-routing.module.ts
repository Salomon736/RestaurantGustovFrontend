import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DishMealPeriodManagementComponent } from './features/restaurant-gustov/views/dish-and-meal-period/index/dish-mealperiod-management.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'menu-management', component: DishMealPeriodManagementComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
