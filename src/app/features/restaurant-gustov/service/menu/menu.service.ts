import { DestroyRef, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, switchMap, forkJoin, map, catchError } from "rxjs";
import { environment } from 'src/environments/environment.development';
import { ApiResponseInterface } from 'src/app/models/api-response.interface';
import { MenuInterface } from '../../models/menu/menu.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuFormModel } from '../../models/menu/menu-form.model';
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly http = inject(HttpClient);
  #destroyRef = inject(DestroyRef);
  #endPointBaseV1 = `${environment.apiRestaurant}/menu`;

  //#region CREATE & UPDATE

  save$(data: MenuFormModel, menuId: number | null = null) {
    if (!menuId)
      return this.http.post<ApiResponseInterface<boolean>>(this.#endPointBaseV1, data)
    else
      return this.http.put<ApiResponseInterface<boolean>>(`${this.#endPointBaseV1}/${menuId}`, data)
  }

  //#endregion CREATE & UPDATE

  //#region READ

  searchByFilter$() {
    return this.http.get<ApiResponseInterface<Array<MenuInterface>>>(this.#endPointBaseV1);
  }

  getById$(menuId: number) {
    return this.http.get<ApiResponseInterface<MenuInterface>>(`${this.#endPointBaseV1}/${menuId}`);
  }
  delete$(menuId: number, destroyRef: DestroyRef) {
    return this.http.delete<ApiResponseInterface<boolean>>(`${this.#endPointBaseV1}/${menuId}`)
      .pipe(takeUntilDestroyed(destroyRef));
  }
}
