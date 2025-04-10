import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PersistentDataService {
  private readonly DATA_CACHE_NAME = 'my-site-data-cache-v1';
  private persistentStringSubject = new BehaviorSubject<string | null>(null);
  
  // Expose as Observable for components to subscribe to
  persistentString$: Observable<string | null> = this.persistentStringSubject.asObservable();

  constructor() {
    // Check if service worker is enabled
    if (!('caches' in window)) {
      console.warn('Cache API not available in this browser');
      return;
    }
    
    // Initialize data on service creation
    this.initializeData();
  }

  private initializeData(): void {
    // Convert Promise to Observable
    this.retrieveDataAsync<string>('persistentString')
      .then(persistentString => {
        if (persistentString) {
          // Data exists from a previous session
          console.log('Retrieved persistent string:', persistentString);
          this.persistentStringSubject.next(persistentString);
        } else {
          // First time the app is run, or data was cleared
          console.log('No persistent string found, setting default value');
          const defaultValue = 'This is the default persistent string';
          this.storeDataAsync('persistentString', defaultValue)
            .then(() => {
              this.persistentStringSubject.next(defaultValue);
            });
        }
      });
  }

  /**
   * Update the persistent string value
   */
  async updatePersistentString(newValue: string): Promise<void> {
    await this.storeDataAsync('persistentString', newValue);
    this.persistentStringSubject.next(newValue);
  }

  /**
   * Get persistent data by key - returns Observable
   */
  getPersistentData<T>(key: string, defaultValue?: T): Observable<T | null> {
    return from(this.retrieveDataAsync<T>(key)).pipe(
      switchMap(value => {
        if (value !== null) {
          return of(value);
        } else if (defaultValue !== undefined) {
          // Set default value if provided and no value exists
          return from(this.storeDataAsync(key, defaultValue)).pipe(
            map(() => defaultValue)
          );
        }
        return of(null);
      }),
      catchError(error => {
        console.error('Error getting persistent data:', error);
        return of(null);
      })
    );
  }

  /**
   * Update persistent data by key - returns Observable
   */
  updatePersistentData<T>(key: string, value: T): Observable<void> {
    return from(this.storeDataAsync(key, value));
  }

  /**
   * Store data in the cache - Promise version
   */
  private async storeDataAsync<T>(key: string, value: T): Promise<void> {
    try {
      const cache = await caches.open(this.DATA_CACHE_NAME);
      const response = new Response(JSON.stringify(value));
      await cache.put(`/data/${key}`, response);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  /**
   * Retrieve data from the cache - Promise version
   */
  private async retrieveDataAsync<T>(key: string): Promise<T | null> {
    try {
      const cache = await caches.open(this.DATA_CACHE_NAME);
      const response = await cache.match(`/data/${key}`);
      
      if (!response) {
        return null;
      }
      
      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }
}
