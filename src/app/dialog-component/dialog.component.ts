import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, ReplaySubject, fromEvent, zip } from 'rxjs';
import { DialogConfigInterface } from '../models/dialog-config.interface';
import { DialogService } from './dialog.service';

@Component({
  selector: 'suint-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  imports: [CommonModule],
  standalone: true,
})
export class DialogComponent implements AfterViewInit {
  @ViewChild('modal') modal!: ElementRef<HTMLDivElement>;
  @ViewChild('overlay') overlay!: ElementRef<HTMLDivElement>;
  #afterClosed = new ReplaySubject<any>(undefined);
  afterClosed$ = this.#afterClosed.asObservable();

  dialogConfig!: DialogConfigInterface | undefined;
  modalAnimationEnd!: Observable<Event>;
  modalLeaveAnimation!: string;
  overlayLeaveAnimation!: string;
  overlayAnimationEnd!: Observable<Event>;
  modalLeaveTiming!: number;
  overlayLeaveTiming!: number;

  constructor(
    private modalService: DialogService,
    private element: ElementRef
  ) { }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.modalService.close();
  }

  onClose() {
    // outside click
    this.modalService.close();
  }

  ngAfterViewInit() {
    this.dialogConfig = this.modalService.dialogConfig;
    this.addOptions();
    this.addEnterAnimations();
  }

  addEnterAnimations() {
    this.modal.nativeElement.style.animation = this.dialogConfig?.animations?.modal?.enter || 'enter-scaling 0.2s ease-out';
    this.overlay.nativeElement.style.animation = this.dialogConfig?.animations?.overlay?.enter || 'fade-in 0.5s';
  }

  addOptions() {
    // Style overload
    this.modal.nativeElement.style.minWidth = this.dialogConfig?.size?.minWidth || 'auto';
    this.modal.nativeElement.style.width = this.dialogConfig?.size?.width || 'auto';
    this.modal.nativeElement.style.maxWidth = this.dialogConfig?.size?.maxWidth || 'auto';
    this.modal.nativeElement.style.minHeight = this.dialogConfig?.size?.minHeight || 'auto';
    this.modal.nativeElement.style.height = this.dialogConfig?.size?.height || 'auto';
    this.modal.nativeElement.style.maxHeight = this.dialogConfig?.size?.maxHeight || 'auto';

    this.modalLeaveAnimation = this.dialogConfig?.animations?.modal?.leave || 'fade-out 0.1s forwards';
    this.overlayLeaveAnimation = this.dialogConfig?.animations?.overlay?.leave || 'fade-out 0.2s forwards';

    this.modalAnimationEnd = this.animationendEvent(this.modal.nativeElement);
    this.overlayAnimationEnd = this.animationendEvent(
      this.overlay.nativeElement
    );

    this.modalLeaveTiming = this.getAnimationTime(this.modalLeaveAnimation);
    this.overlayLeaveTiming = this.getAnimationTime(this.overlayLeaveAnimation);
  }

  animationendEvent(element: HTMLDivElement) {
    return fromEvent(element, 'animationend');
  }

  removeElementIfNoAnimation(element: HTMLDivElement, animation: string) {
    if (!animation) {
      element.remove();
    }
  }

  close(returnValue: any = null) {
    this.modal.nativeElement.style.animation = this.modalLeaveAnimation;
    this.overlay.nativeElement.style.animation = this.overlayLeaveAnimation;

    // Goal here is to clean up the DOM to not have 'dead elements'
    // No animations on both elements
    if (
      !this.dialogConfig?.animations?.modal?.leave &&
      !this.dialogConfig?.animations?.overlay?.leave
    ) {
      this.modalService.dialogConfig = undefined;
      this.element.nativeElement.remove();
      this.#afterClosed.next(returnValue);

      return;
    }

    // Remove element if not animated
    this.removeElementIfNoAnimation(
      this.modal.nativeElement,
      this.modalLeaveAnimation
    );
    this.removeElementIfNoAnimation(
      this.overlay.nativeElement,
      this.overlayLeaveAnimation
    );

    // Both elements are animated, remove modal as soon as longest one ends
    if (this.modalLeaveTiming > this.overlayLeaveTiming) {
      this.modalAnimationEnd.subscribe(() => {
        this.element.nativeElement.remove();
      });
    } else if (this.modalLeaveTiming < this.overlayLeaveTiming) {
      this.overlayAnimationEnd.subscribe(() => {
        this.element.nativeElement.remove();
      });
    } else {
      zip(this.modalAnimationEnd, this.overlayAnimationEnd).subscribe(() => {
        this.element.nativeElement.remove();
      });
    }

    this.modalService.dialogConfig = undefined;
    this.#afterClosed.next(returnValue);
  }

  getAnimationTime(animation: string) {
    let animationTime = 0;
    const splittedAnimation = animation.split(' ');
    for (const expression of splittedAnimation) {
      const currentValue = +expression.replace(/s$/, '');
      if (!isNaN(currentValue)) {
        animationTime = currentValue;
        break;
      }
    }

    return animationTime;
  }
}
