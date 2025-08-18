import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DishMealPeriodManagementComponent } from './features/restaurant-gustov/views/dish-and-meal-period/index/dish-mealperiod-management.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { MenuManagementComponent } from './features/restaurant-gustov/views/menu/index/menu-index.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DishMealPeriodManagementComponent,
    MenuManagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
