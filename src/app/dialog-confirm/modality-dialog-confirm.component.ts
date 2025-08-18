import { Component, inject } from "@angular/core";
import { DialogService } from "../dialog-component/dialog.service";

@Component({
  selector: 'modality-dialog-confirm',
  templateUrl: './modality-dialog-confirm.component.html',
  standalone: true,
  imports: []
})
export class ModalityDialogConfirmComponent {
  #dialogService = inject(DialogService)


  cancel(){
    this.#dialogService.close()
  }

  deleteModality(){
    this.#dialogService.close(true);
  }
}
