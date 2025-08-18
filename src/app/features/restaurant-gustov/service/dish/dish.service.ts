import { DestroyRef, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, switchMap, forkJoin, map, catchError } from "rxjs";
import { environment } from 'src/environments/environment.development';
import { ApiResponseInterface } from 'src/app/models/api-response.interface';
import { DishInterface } from '../../models/dish/dish.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DishFormModel } from '../../models/dish/dish-form.model';
// import { FileStorageService } from '../file-storage/file-storage.service';
@Injectable({
  providedIn: 'root'
})
export class DishService {
  private readonly http = inject(HttpClient);
  #destroyRef = inject(DestroyRef);
  //Organization endPoint of dish API V1
  #endPointBaseV1 = `${environment.apiRestaurant}/dish`;

  //#region CREATE & UPDATE

  save$(data: DishFormModel, dishId: number | null = null) {
    if (!dishId)
      return this.http.post<ApiResponseInterface<boolean>>(this.#endPointBaseV1, data)
    else
      return this.http.put<ApiResponseInterface<boolean>>(`${this.#endPointBaseV1}/${dishId}`, data)
  }

  //#endregion CREATE & UPDATE

  //#region READ

  searchByFilter$() {
    return this.http.get<ApiResponseInterface<Array<DishInterface>>>(this.#endPointBaseV1);
  }

  getById$(dishId: number) {
    return this.http.get<ApiResponseInterface<DishInterface>>(`${this.#endPointBaseV1}/${dishId}`);
  }
}
