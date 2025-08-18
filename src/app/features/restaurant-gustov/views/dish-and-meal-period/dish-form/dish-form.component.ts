// dish-form.component.ts
import { Component, DestroyRef, inject, signal, computed, effect } from '@angular/core';
import { DialogService } from 'src/app/dialog-component/dialog.service';
// import { SuintDialogHeaderComponent } from '@suint/shared/dialog-header';
// import { SuintButtonDirective, SuintInputDirective } from '@suint/shared/directives';
import { ToastService } from 'src/app/toast-notification/toast.service';
import { DishInterface } from '../../../models/dish/dish.interface';
import { DishFormModel } from '../../../models/dish/dish-form.model';
// import { ImageEditOptions } from '@suint/shared/service';
import { DishService } from '../../../service/dish/dish.service';
// import { ImageEditingService } from '@suint/shared/service';
// import { FileStorageService } from '../../../service';
import { ApiResponseInterface } from 'src/app/models/api-response.interface';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize, forkJoin, lastValueFrom } from 'rxjs';
import { ComponentHelper } from 'src/app/helpers/component.helper';
// import { WorkAreaBaseComponent } from '../../../../human-resources/views/work-area/work-area-base-component';
// import { SuintComponentHelper } from '@suint/shared/helpers';

@Component({
  selector: 'suint-dish-form',
  templateUrl: './dish-form.component.html',
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
export class DishFormComponent {
  #dishService = inject(DishService);
  #toastService = inject(ToastService);
  #componentHelper = inject(ComponentHelper);

  dialogService = inject(DialogService);
  isLoading = false;
  msgLoading = '';

  dishId = signal<number | null>((this.dialogService.dialogConfig?.data as any)?.dishId ?? null);

  formGroup!: FormGroup<{
    name: FormControl<string | null>;
    description: FormControl<string | null>;
    image: FormControl<string | null>;
    price: FormControl<number | null>;
}>;

  isProsesing = signal(false);
  isUploadingImage = signal(false);
  entityOrigin = signal(new DishFormModel());
  entityForm = signal(new DishFormModel());
  selectedFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);

  // Valor computado para isDifferent
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
  onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrl.set(e.target.result);
      this.formGroup.controls.image.setValue(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}
  async save(event: Event) {
    event.preventDefault();
    const updatedEntityForm = {
      ...this.entityForm(),
      name: this.formGroup.controls.name.value,
      description: this.formGroup.controls.description.value,
      image: this.formGroup.controls.image.value,
      price: this.formGroup.controls.price.value
    };

    this.entityForm.set(updatedEntityForm);

    this.entityForm.set(updatedEntityForm);
    this.msgLoading = 'Guardando';
    this.isProsesing.set(true);

    const isNewDish = this.dishId === null;
    console.log('ID DE PLATO: ',this.dishId())
    console.log('OBJETO PARA CREAR PLATO: ',this.entityForm())
    this.#dishService.save$(this.entityForm(), this.dishId())
    .pipe(finalize(() => { this.isProsesing.set(false); }))
    .subscribe({
      next: (response: ApiResponseInterface<boolean>) => {
        console.log('Respuesta al crear plato: ', response);
        if (response.isSuccess) {

          this.dialogService.close(1);
          const action = isNewDish ? 'creado' : 'actualizado';
          const successMessage = `El plato ha sido ${action} correctamente. ${response.message || ''}`;
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
      name: new FormControl<string | null>(null, [Validators.required]),
      description: new FormControl<string | null>(null, [Validators.required]),
      image: new FormControl<string | null>(null),
      price: new FormControl<number | null>(null, [Validators.required])
    });
  }

  #loadData() {
    console.log('ID DE DISH: ',this.dishId());
    if (this.dishId() && this.dishId()! > 0) {
      this.msgLoading = 'Cargando datos';
      this.isProsesing.set(true);

      this.#dishService.getById$(this.dishId()!)
      .pipe(finalize(() => this.isProsesing.set(false)))
      .subscribe({
        next: (value: ApiResponseInterface<DishFormModel>) => {
          console.log('Respuesta getById:', value);
          this.formGroup.setValue({
            name: value.data.name,
            description: value.data.description,
            image: value.data.image,
            price: value.data.price
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
      name: this.formGroup.controls.name.value as string,
      description: this.formGroup.controls.description.value as string,
      image: this.formGroup.controls.image.value as string,
      price: this.formGroup.controls.price.value as number
    };

    this.entityForm.set(updatedEntityForm);
  }
  //#endregion Private Methods
}
