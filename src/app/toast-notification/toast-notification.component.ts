import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostBinding, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  title!: string;
  message!: string;
  type!: string;
  icon!: string;
  duration!: number;
actions: { text: string; handler: (event?: MouseEvent) => void }[] = [];
  @HostBinding('class') class = 'toast-container';

  #afterClosed = new ReplaySubject<any>(1);
  afterClosed$ = this.#afterClosed.asObservable();

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.elementRef.nativeElement.style.animation = ' 0.3s ease-out';
    this.elementRef.nativeElement.style.setProperty('--duration', `${this.duration / 1000}s`);
  }

  close() {
    this.elementRef.nativeElement.classList.add('fade-out');
    setTimeout(() => {
      this.#afterClosed.next(null);
      this.#afterClosed.complete();
      this.elementRef.nativeElement.remove();
    });
  }

  ngOnDestroy() {
    // Limpiar si es necesario
  }
}
