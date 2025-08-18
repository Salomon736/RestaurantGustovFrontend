import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { DialogService } from 'src/app/dialog-component/dialog.service';
import { ToastService } from 'src/app/toast-notification/toast.service';
import { MealPeriodFormModel } from '../../../models/meal-period/meal-period-form.model';
import { MealPeriodService } from '../../../service/meal-period/meal-period.service';
import { ApiResponseInterface } from 'src/app/models/api-response.interface';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ComponentHelper } from 'src/app/helpers/component.helper';

@Component({
  selector: 'suint-meal-period-form',
  templateUrl: './meal-period-form.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styles: [`
    .form-field-invalid {
      label {
        color: red;
      }

      input {
        border-color: red;
      }

      .msg-validation-error {
        font-size: 0.75rem;
        color: red;
        font-weight: bold;
      }
    }

    .color-preview {
      width: 100%;
      height: calc(100% - 25px);
    }
  `]
})
export class MealPeriodFormComponent {
  #mealPeriodService = inject(MealPeriodService);
  #toastService = inject(ToastService);
  #componentHelper = inject(ComponentHelper);

  dialogService = inject(DialogService);
  isLoading = false;
  msgLoading = '';

  mealPeriodId = signal<number | null>((this.dialogService.dialogConfig?.data as any)?.mealPeriodId ?? null);

  formGroup!: FormGroup<{
    nameMealPeriod: FormControl<string | null>;
    startTime: FormControl<string | null>;
    endTime: FormControl<string | null>;
    color: FormControl<string | null>;
}>;

  isProsesing = signal(false);
  isUploadingImage = signal(false);
  entityOrigin = signal(new MealPeriodFormModel());
  entityForm = signal(new MealPeriodFormModel());

  isDifferent = computed(() =>
    this.#componentHelper.objectIsDifferent(this.entityOrigin(), this.entityForm())
  );

  constructor() {
    this.#initializeComponent();
    this.#initializeValueChanges();
    this.#loadData();
  }

  close() {
    this.dialogService.close();
  }
  async save(event: Event) {
    event.preventDefault();
    const updatedEntityForm = {
      ...this.entityForm(),
      name: this.formGroup.controls.nameMealPeriod.value,
      description: this.formGroup.controls.startTime.value,
      image: this.formGroup.controls.endTime.value,
      price: this.formGroup.controls.color.value
    };

    this.entityForm.set(updatedEntityForm);

    this.entityForm.set(updatedEntityForm);
    this.msgLoading = 'Guardando';
    this.isProsesing.set(true);

    const isNewDish = this.mealPeriodId === null;
    this.#mealPeriodService.save$(this.entityForm(), this.mealPeriodId())
    .pipe(finalize(() => { this.isProsesing.set(false); }))
    .subscribe({
      next: (response: ApiResponseInterface<boolean>) => {
        if (response.isSuccess) {
          this.dialogService.close(1);
          const action = isNewDish ? 'creado' : 'actualizado';
          const successMessage = `El periodo de comida ha sido ${action} correctamente. ${response.message || ''}`;
          this.#toastService.open('Éxito', successMessage.trim(), { type: 'success' });
        } else {
          console.log(response.errors);
          const action = isNewDish ? 'crear' : 'actualizar';
          this.#toastService.open('Error', response.errors?.join(', ') || `No se pudo ${action} el plato`, { type: 'error' });
        }
      },
      error: (e) => {
        console.log(e);
        const action = isNewDish ? 'crear' : 'actualizar';
        this.#toastService.open('Error', `Ocurrió un error al ${action} el plato`, { type: 'error' });
      }
    });
  }

  //#region Private Methods
  #initializeComponent() {
    this.formGroup = new FormGroup({
      nameMealPeriod: new FormControl<string | null>(null, [Validators.required]),
      startTime: new FormControl<string | null>(null, [Validators.required]),
      endTime: new FormControl<string | null>(null),
      color: new FormControl<string | null>(null, [Validators.required])
    });
  }

  #loadData() {
    if (this.mealPeriodId() && this.mealPeriodId()! > 0) {
      this.msgLoading = 'Cargando datos';
      this.isProsesing.set(true);

      this.#mealPeriodService.getById$(this.mealPeriodId()!)
      .pipe(finalize(() => this.isProsesing.set(false)))
      .subscribe({
        next: (value: ApiResponseInterface<MealPeriodFormModel>) => {
          console.log('Respuesta getById:', value);
          this.formGroup.setValue({
            nameMealPeriod: value.data.nameMealPeriod,
            startTime: value.data.startTime,
            endTime: value.data.endTime,
            color: value.data.color
          });
          this.#setEntityFormValues();

          this.entityOrigin.set({...this.entityForm()});
        },
        error: (e) => console.log(e)
      });
    }
  }

  #initializeValueChanges() {
    this.formGroup.valueChanges.subscribe({
      next: (value) => {
        this.#setEntityFormValues();
      },
      error: (e) => console.log(e)
    });
  }

  #setEntityFormValues() {
    const updatedEntityForm = {
      ...this.entityForm(),
      nameMealPeriod: this.formGroup.controls.nameMealPeriod.value as string,
      startTime: this.formGroup.controls.startTime.value as string,
      endTime: this.formGroup.controls.endTime.value as string,
      color: this.formGroup.controls.color.value as string
    };

    this.entityForm.set(updatedEntityForm);
  }
  //#endregion Private Methods
}
