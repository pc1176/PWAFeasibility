import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

export interface PendingDevice {
  id?: number;
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class IndexDbService {

  private dbName = 'deviceDB';
  private storeName = 'pendingDevices';
  private db: IDBPDatabase | null = null;

  async initDB() {
    if (!this.db) {
      this.db = await openDB(this.dbName, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('pendingDevices')) {
            db.createObjectStore('pendingDevices', {
              keyPath: 'id',
              autoIncrement: true
            });
          }
        },
      });
    }
    return this.db;
  }

  async addPendingDevice(deviceData: any): Promise<any> {
    const db = await this.initDB();
    const pendingDevice: PendingDevice = {
      data: deviceData, 
      timestamp: Date.now()
    };
    return db.add(this.storeName, pendingDevice);
  }

  async getPendingDevices(): Promise<PendingDevice[]> {
    const db = await this.initDB();
    return db.getAll(this.storeName);
  }

  async removePendingDevice(id: number): Promise<void> {
    const db = await this.initDB();
    await db.delete(this.storeName, id);
  }
}
