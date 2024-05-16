import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class OpenFoodFactService {
  apiUrl: string = 'https://world.openfoodfacts.org/api/v0/product/';

  constructor(private http: HttpClient) {}

  async getProductInfo(barcode: string): Promise<Product> {
    return new Promise<Product>((resolve, reject) => {
      this.http.get(`${this.apiUrl}${barcode}.json`).subscribe(
        async (data: any) => {
          console.log(data);
          const scannedProduct = new Product();
          if (data.status == 1) {
            scannedProduct.identifiant = data.product._id;
            scannedProduct.brand = data.product.brands;
            scannedProduct.image = data.product.image_front_small_url;
            scannedProduct.allergenes = data.product.allergens_imported;
            scannedProduct.score = data.product.ecoscore_score;
            scannedProduct.nameFr = data.product.product_name_fr;
            resolve(scannedProduct);
          } else {
            scannedProduct.identifiant = '0';
            resolve(scannedProduct);
          }
        },
        (error) => {
          console.error(
            "Une erreur s'est produite lors de la récupération des informations du produit ",
            error
          );
          reject(error);
        }
      );
    });
  }
}
