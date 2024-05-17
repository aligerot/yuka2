import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  BarcodeFormat,
  LensFacing,
  BarcodeScanner,
  Barcode,
  StartScanOptions,
} from '@capacitor-mlkit/barcode-scanning';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnDestroy {
  @Input()
  public formats: BarcodeFormat[] = [];

  constructor(
    private readonly dialogService: DialogService,
    private readonly ngZone: NgZone
  ) {}

  public ngOnDestroy(): void {
    //si on quitte la modal, on arrete le scan
    this.stopScan();
  }

  public async closeModal(barcode?: Barcode): Promise<void> {
    this.dialogService.dismissModal({
      barcode: barcode,
    });
  }

  public async ngOnInit(): Promise<void> {
    await this.startScan();
  }

  private async startScan(): Promise<void> {
    //on active l'affichage de la camera
    document.querySelector('body')?.classList.add('barcode-scanning-active');

    const options: StartScanOptions = {
      formats: this.formats,
      lensFacing: LensFacing.Back,
    };

    const listener = await BarcodeScanner.addListener(
      'barcodeScanned',
      //lorsque le code barre est scanné, on ferme la modal
      async (event) => {
        this.ngZone.run(() => {
          listener.remove();
          this.closeModal(event.barcode);
        });
      }
    );

    await BarcodeScanner.startScan(options);
  }

  private async stopScan(): Promise<void> {
    //on désactive l'affichage de la caméra
    document.querySelector('body')?.classList.remove('barcode-scanning-active');
    await BarcodeScanner.stopScan();
  }
}
