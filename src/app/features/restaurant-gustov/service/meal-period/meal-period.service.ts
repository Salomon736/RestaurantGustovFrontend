import { DestroyRef, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, switchMap, forkJoin, map, catchError } from "rxjs";
import { environment } from 'src/environments/environment.development';
import { ApiResponseInterface } from 'src/app/models/api-response.interface';
import { MealPeriodInterface } from '../../models/meal-period/meal-period.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MealPeriodFormModel } from '../../models/meal-period/meal-period-form.model';
@Injectable({
  providedIn: 'root'
})
export class MealPeriodService {
  private readonly http = inject(HttpClient);
  #destroyRef = inject(DestroyRef);
  #endPointBaseV1 = `${environment.apiRestaurant}/mealPeriod`;

  //#region CREATE & UPDATE

  save$(data: MealPeriodFormModel, mealPeriodId: number | null = null) {
    if (!mealPeriodId)
      return this.http.post<ApiResponseInterface<boolean>>(this.#endPointBaseV1, data)
    else
      return this.http.put<ApiResponseInterface<boolean>>(`${this.#endPointBaseV1}/${mealPeriodId}`, data)
  }

  //#endregion CREATE & UPDATE

  //#region READ

  searchByFilter$() {
    return this.http.get<ApiResponseInterface<Array<MealPeriodInterface>>>(this.#endPointBaseV1);
  }

  getById$(mealPeriodId: number) {
    return this.http.get<ApiResponseInterface<MealPeriodInterface>>(`${this.#endPointBaseV1}/${mealPeriodId}`);
  }
  delete$(mealPeriodId: number, destroyRef: DestroyRef) {
    return this.http.delete<ApiResponseInterface<boolean>>(`${this.#endPointBaseV1}/${mealPeriodId}`)
      .pipe(takeUntilDestroyed(destroyRef));
  }
}
