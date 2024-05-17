import { Component, NgZone, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import {
  Barcode,
  BarcodeScanner,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';
import { DialogService } from '../services/dialog.service';
import { ModalComponent } from './modal/modal.component';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { OpenFoodFactService } from '../services/open-food-fact-service.service';
import { IndexedDbService } from '../services/index-db.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public formGroup = new UntypedFormGroup({
    googleBarcodeScannerModuleInstallState: new UntypedFormControl(0),
    googleBarcodeScannerModuleInstallProgress: new UntypedFormControl(0),
  });

  message: string = '';
  loading: boolean = false;
  scannedProducts: Product[] = [];

  constructor(
    private indexedDbService: IndexedDbService,
    private openfoodfactservice: OpenFoodFactService,
    private toastController: ToastController,
    private router: Router,
    private http: HttpClient,
    private readonly dialogService: DialogService,
    private readonly ngZone: NgZone
  ) {}

  public ngOnInit(): void {
    this.loadProductsFromDatabase();
    BarcodeScanner.removeAllListeners().then(() => {
      BarcodeScanner.addListener(
        //on installe le module googlebarcodescanner
        'googleBarcodeScannerModuleInstallProgress',
        (event) => {
          this.ngZone.run(() => {
            console.log('googleBarcodeScannerModuleInstallProgress', event);
            const { state, progress } = event;
            this.formGroup.patchValue({
              googleBarcodeScannerModuleInstallState: state,
              googleBarcodeScannerModuleInstallProgress: progress,
            });
          });
        }
      );
    });
  }

  public async startScan(): Promise<void> {
    const element = await this.dialogService.showModal({
      component: ModalComponent,
      showBackdrop: false,
      componentProps: {
        //EAN_13 = code barre
        formats: 'EAN_13',
      },
    });
    element.onDidDismiss().then(async (result) => {
      const barcode: Barcode | undefined = result.data?.barcode;
      if (barcode) {
        this.loading = true; // Démarre le chargement
        try {
          await this.getProductInfo(barcode.rawValue);
        } finally {
          this.loading = false; // Arrête le chargement, que la requête réussisse ou échoue
        }
      }
    });
  }

  async getProductInfo(barcode: string): Promise<void> {
    try {
      //on cherche si il existe déjà un produit avec cet id en mémoire
      const existant = this.scannedProducts.filter(
        (t) => t.identifiant == barcode
      );
      if (existant.length != 0) {
        this.presentToast('Ce produit a déjà été scanné');
        this.playAlreadyScanned();
        this.afficherDetail(existant[0]);
      } else {
        //appel à 'api openfoodfacts
        const produit = await this.openfoodfactservice.getProductInfo(barcode);
        //pour les produits non trouvé, l'id est set à 0
        if (produit.identifiant == '0') {
          this.presentToast(
            "Ce produit n'a pas été trouvé, code barre = " + barcode
          );
          this.playNotFoundSound();
        } else {
          this.scannedProducts.push(produit);
          this.indexedDbService.addData('myObjectStore', produit);
          this.afficherDetail(produit);
          this.playSuccessSound();
        }
      }
    } catch (error) {
      //si quelque chose se passe mal (api qui fonctionne pas, pas internet etc..)
      console.error(
        "Une erreur s'est produite lors de la récupération des informations du produit :",
        error
      );
      this.presentToast(
        "Une erreur s'est produite lors de la récupération des informations du produit, il est possible que l'API OpenFoodFact soit momentanément indisponible"
      );
    }
  }

  playAlreadyScanned() {
    const audio = new Audio();
    audio.src = 'assets/sound/movie_1.mp3';
    audio.load();
    audio.play();
  }

  playNotFoundSound() {
    const audio = new Audio();
    audio.src = 'assets/sound/undertakers-bell_2UwFCIe.mp3';
    audio.load();
    audio.play();
  }

  playSuccessSound() {
    const audio = new Audio();
    audio.src = 'assets/sound/ding-sound-effect_2.mp3';
    audio.load();
    audio.play();
  }

  //redirection vers la page de détail des produits
  afficherDetail(product: Product) {
    this.router.navigate(['/product-detail'], { state: { product } });
  }

  //Permet d'afficher un bandeau en bas de l'écran avec un message pendant 4 secondes
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
    });
    toast.present();
  }

  async loadProductsFromDatabase() {
    try {
      await this.indexedDbService.openDb();
      const products = await this.indexedDbService.getAllData('myObjectStore');
      this.scannedProducts = products;
    } catch (error) {
      console.error('Error loading products from database:', error);
    }
  }
}
