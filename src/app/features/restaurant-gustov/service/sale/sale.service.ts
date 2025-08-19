import { DestroyRef, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, switchMap, forkJoin, map, catchError } from "rxjs";
import { environment } from 'src/environments/environment.development';
import { ApiResponseInterface } from 'src/app/models/api-response.interface';
import { SaleInterface } from '../../models/sale/sale.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SaleFormModel } from '../../models/sale/sale-form.model';
@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly http = inject(HttpClient);
  #destroyRef = inject(DestroyRef);
  #endPointBaseV1 = `${environment.apiRestaurant}/sale`;

  //#region CREATE & UPDATE

  save$(data: SaleFormModel, saleId: number | null = null) {
    if (!saleId)
      return this.http.post<ApiResponseInterface<boolean>>(this.#endPointBaseV1, data)
    else
      return this.http.put<ApiResponseInterface<boolean>>(`${this.#endPointBaseV1}/${saleId}`, data)
  }

  //#endregion CREATE & UPDATE

  //#region READ

  searchByFilter$() {
    return this.http.get<ApiResponseInterface<Array<SaleInterface>>>(this.#endPointBaseV1);
  }

  getById$(saleId: number) {
    return this.http.get<ApiResponseInterface<SaleInterface>>(`${this.#endPointBaseV1}/${saleId}`);
  }
  delete$(saleId: number, destroyRef: DestroyRef) {
    return this.http.delete<ApiResponseInterface<boolean>>(`${this.#endPointBaseV1}/${saleId}`)
      .pipe(takeUntilDestroyed(destroyRef));
  }
}
