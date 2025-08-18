import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComponentHelper {
  toastError(arg0: string) {
    throw new Error("Method not implemented.");
  }
  toastSuccess(arg0: string) {
    throw new Error("Method not implemented.");
  }

  objectIsDifferent<T>(source: T, target: T): boolean {
    const sourceObj = JSON.stringify(source);
    const targetObj = JSON.stringify(target);
    return sourceObj !== targetObj;
  }

  objectIsLooselyDifferent<T>(source: T, target: T): boolean {
    const normalize = (obj: any) => {
      return JSON.parse(
        JSON.stringify(obj, (key, value) => {
          if (value === null || value === '') return '';
          return value;
        })
      );
    };

    const normalizedSource = normalize(source);
    const normalizedTarget = normalize(target);

    return JSON.stringify(normalizedSource) !== JSON.stringify(normalizedTarget);
  }
}
