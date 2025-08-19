import { DishInterface } from "../dish/dish.interface";
import { MealPeriodInterface } from "../meal-period/meal-period.interface";

export interface MenuInterface {
  id: number;
  menuDate: Date;
  quantity: number;
  idDish: number;
  idMealPeriod: number;
  idLounge: number;
  dish: DishInterface;
  mealPeriod: MealPeriodInterface;
}
