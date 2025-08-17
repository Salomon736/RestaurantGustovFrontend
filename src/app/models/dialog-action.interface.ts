import { Observable } from 'rxjs';

export interface DialogActionInterface {
  afterClosed: () => Observable<any>;
}
