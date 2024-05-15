import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BarcodeFormat, LensFacing, BarcodeScanner, Barcode, StartScanOptions } from '@capacitor-mlkit/barcode-scanning';
import { InputCustomEvent } from '@ionic/angular';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent

  implements  AfterViewInit, OnDestroy
  {
    @Input()
    public formats: BarcodeFormat[] = [];
  
    @ViewChild('square')
    public squareElement: ElementRef<HTMLDivElement> | undefined;

  
    constructor(
      private readonly dialogService: DialogService,
      private readonly ngZone: NgZone,
    ) {}

  
    public ngAfterViewInit(): void {
      setTimeout(() => {
        this.startScan();
      }, 500);
    }
  
    public ngOnDestroy(): void {
      this.stopScan();
    }
  
    public setZoomRatio(event: InputCustomEvent): void {
      if (!event.detail.value) {
        return;
      }
      BarcodeScanner.setZoomRatio({
        zoomRatio: parseInt(event.detail.value as any, 10),
      });
    }
  
    public async closeModal(barcode?: Barcode): Promise<void> {
      this.dialogService.dismissModal({
        barcode: barcode,
      });
    }
  
    public async toggleTorch(): Promise<void> {
      await BarcodeScanner.toggleTorch();
    }
  
    private async startScan(): Promise<void> {
      // Hide everything behind the modal (see `src/theme/variables.scss`)
      document.querySelector('body')?.classList.add('barcode-scanning-active');
  
      const options: StartScanOptions = {
        formats: this.formats,
        lensFacing: LensFacing.Back
      };
  
      const squareElementBoundingClientRect =
        this.squareElement?.nativeElement.getBoundingClientRect();
      const scaledRect = squareElementBoundingClientRect
        ? {
            left: squareElementBoundingClientRect.left * window.devicePixelRatio,
            right:
              squareElementBoundingClientRect.right * window.devicePixelRatio,
            top: squareElementBoundingClientRect.top * window.devicePixelRatio,
            bottom:
              squareElementBoundingClientRect.bottom * window.devicePixelRatio,
            width:
              squareElementBoundingClientRect.width * window.devicePixelRatio,
            height:
              squareElementBoundingClientRect.height * window.devicePixelRatio,
          }
        : undefined;
      const detectionCornerPoints = scaledRect
        ? [
            [scaledRect.left, scaledRect.top],
            [scaledRect.left + scaledRect.width, scaledRect.top],
            [
              scaledRect.left + scaledRect.width,
              scaledRect.top + scaledRect.height,
            ],
            [scaledRect.left, scaledRect.top + scaledRect.height],
          ]
        : undefined;
      const listener = await BarcodeScanner.addListener(
        'barcodeScanned',
        async (event) => {
          this.ngZone.run(() => {
            const cornerPoints = event.barcode.cornerPoints;
            if (detectionCornerPoints && cornerPoints) {
              if (
                detectionCornerPoints[0][0] > cornerPoints[0][0] ||
                detectionCornerPoints[0][1] > cornerPoints[0][1] ||
                detectionCornerPoints[1][0] < cornerPoints[1][0] ||
                detectionCornerPoints[1][1] > cornerPoints[1][1] ||
                detectionCornerPoints[2][0] < cornerPoints[2][0] ||
                detectionCornerPoints[2][1] < cornerPoints[2][1] ||
                detectionCornerPoints[3][0] > cornerPoints[3][0] ||
                detectionCornerPoints[3][1] < cornerPoints[3][1]
              ) {
                return;
              }
            }
            listener.remove();
            this.closeModal(event.barcode);
          });
        },
      );
      await BarcodeScanner.startScan(options);
    }
  
    private async stopScan(): Promise<void> {
      // Show everything behind the modal again
      document.querySelector('body')?.classList.remove('barcode-scanning-active');
  
      await BarcodeScanner.stopScan();
    }

}
