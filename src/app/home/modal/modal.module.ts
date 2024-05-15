import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ModalComponent } from './modal.component'; // Adjust the path as needed

@NgModule({
  declarations: [ModalComponent],
  imports: [CommonModule, IonicModule],
  exports: [ModalComponent]
})
export class ModalModule {}