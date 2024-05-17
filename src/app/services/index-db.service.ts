import { Injectable, OnInit } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private db!: IDBDatabase;

  constructor() {}

  async openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('myDatabase', 1);

      request.onerror = () => {
        console.error('Failed to open database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(undefined);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as any).result;
        db.createObjectStore('myObjectStore', { keyPath: 'identifiant' });
      };
    });
  }

  async getObjectStore(
    storeName: string,
    mode: IDBTransactionMode = 'readonly'
  ) {
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async addData(storeName: string, data: Product) {
    const objectStore = await this.getObjectStore(storeName, 'readwrite');
    const request = objectStore.add(data);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllData(storeName: string): Promise<Product[]> {
    try {
      const objectStore = await this.getObjectStore(storeName);
      return new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = (event: Event) => {
          const target = event.target as IDBRequest;
          const products: Product[] = target.result;
          resolve(products);
        };
        request.onerror = (event: Event) => {
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('Error getting all data:', error);
      throw error;
    }
  }
}
