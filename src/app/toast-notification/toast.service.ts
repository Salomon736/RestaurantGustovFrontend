import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Injectable } from '@angular/core';
import { ToastNotificationComponent } from './toast-notification.component';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastComponents: ComponentRef<ToastNotificationComponent>[] = [];

  // Mapa de íconos según el tipo de notificación
  private iconMap: { [key: string]: string } = {
    success: '/assets/icons/icon-success.svg',
    error: '/assets/icons/icon-error.svg',
    info: '/assets/icons/icon-info.svg',
    update: '/assets/icons/icon-arrows-clockwise.svg',
    delete: '/assets/icons/icon-delete.svg'
  };

  constructor(private appRef: ApplicationRef, private injector: EnvironmentInjector) {}

  open(title: string, message: string, config?: { duration?: number; type?: string ; actionText?: string;
    action?: () => void;}): Observable<any> {
    const duration = config?.duration || 3000;
    const type = config?.type || 'info';
  const action = config?.action;
    const toastComponent = createComponent(ToastNotificationComponent, {
      environmentInjector: this.injector,
    });

    toastComponent.instance.icon = this.iconMap[type] || this.iconMap['info'];
    toastComponent.instance.title = title;
    toastComponent.instance.message = message;
    toastComponent.instance.type = type;
    toastComponent.instance.duration = duration;
    toastComponent.instance.actions = [];
    if (action) {
      toastComponent.instance.actions.push({
        text: config?.actionText || 'Aceptar',
        handler: () => {
         console.log('Ejecutando acción del toast');

          action();
          toastComponent.instance.close();
        },
      });
    }
    document.body.appendChild(toastComponent.location.nativeElement);
    this.appRef.attachView(toastComponent.hostView);

    this.toastComponents.push(toastComponent);

    const closeSubject = new Subject<any>();
    toastComponent.instance.afterClosed$.subscribe(() => {
      this.removeToast(toastComponent);
      closeSubject.next(null);
      closeSubject.complete();
    });

    setTimeout(() => {
      toastComponent.instance.close();
    }, duration);

    return closeSubject.asObservable();
  }

  private removeToast(toastComponent: ComponentRef<ToastNotificationComponent>) {
    const index = this.toastComponents.indexOf(toastComponent);
    if (index >= 0) {
      this.toastComponents.splice(index, 1);
      this.appRef.detachView(toastComponent.hostView);
      toastComponent.location.nativeElement.remove();
    }
  }
}
