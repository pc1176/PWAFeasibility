import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
declare const L: any;
@Component({
  selector: 'app-viewmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewmap.component.html',
  styleUrl: './viewmap.component.scss'
})
export class ViewmapComponent implements OnInit {
  logs: { time: string; message: string }[] = [];
  title = 'locationApp';
  maplocation: {latitude: number, longitude: number} = {latitude: 0, longitude: 0};
  constructor(private router: Router) {}  // Inject Router
  ngOnInit() {
    this.loadLogs(); 
    if (!navigator.geolocation) {
      console.log('location is not supported');
    }
    navigator.geolocation.getCurrentPosition((position) => {
      this.maplocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      const coords = position.coords;
      const latLong = [coords.latitude, coords.longitude];
      console.log(
        `lat: ${position.coords.latitude}, lon: ${position.coords.longitude}`
      );
      let mymap = L.map('map').setView(latLong, 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mymap);
      
      //     id: 'mapbox/streets-v11',
      //     tileSize: 512,
      //     zoomOffset: -1,
      //     accessToken: 'your.mapbox.access.token',
      //   }
      // ).addTo(mymap);

      let marker = L.marker(latLong).addTo(mymap);

      marker.bindPopup('<b>Hi</b>').openPopup();

      let popup = L.popup()
        .setLatLng(latLong)
        .setContent('my current location')  
        .openOn(mymap);
    });
    this.watchPosition();
  }

  watchPosition() {
    let desLat = 0;
    let desLon = 0;
    let id = navigator.geolocation.watchPosition(
      (position) => {
        console.log(
          `lat: ${position.coords.latitude}, lon: ${position.coords.longitude}`
        );
        if (position.coords.latitude === desLat) {
          navigator.geolocation.clearWatch(id);
        }
      },
      (err) => {
        console.log(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  private async loadLogs(): Promise<void> {
    const logs = await this.getLogsFromDB();
    this.logs = logs;
  }

  private getLogsFromDB(): Promise<{ time: string; message: string }[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("locationDB", 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction("logs", "readonly");
        const store = tx.objectStore("logs");
        const getAll = store.getAll();

        getAll.onsuccess = (event) => {
          resolve((event.target as IDBRequest).result); // ✅ Fix applied here
        };
  
        getAll.onerror = () => reject("Error reading logs from IndexedDB");
      };

      request.onerror = () => reject("IndexedDB not accessible");
    });
  }
    
  
  // Navigate back to the dashboard
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
