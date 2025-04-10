import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PersistentDataService } from '../../shared/services/persistent-data.service';



interface UserPreferences {
  theme: string;
  fontSize: number;
  notifications: boolean;
}

@Component({
  selector: 'app-persistent-data-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './persistent-data-demo.component.html',
  styleUrl: './persistent-data-demo.component.scss'
})
export class PersistentDataDemoComponent implements OnInit {
  preferencesForm = new FormGroup({
    theme: new FormControl('light'),
    fontSize: new FormControl(16),
    notifications: new FormControl(true)
  });
  
  noteControl = new FormControl('');
  lastVisit: string | null = null;
  
  constructor(private persistentDataService: PersistentDataService) {}
  
  ngOnInit(): void {
    // Load user preferences
    this.persistentDataService.getPersistentData<UserPreferences>('userPreferences', {
      theme: 'light',
      fontSize: 16,
      notifications: true
    }).subscribe(prefs => {
      if (prefs) {
        this.preferencesForm.setValue(prefs);
      }
    });
    
    // Load saved note
    this.persistentDataService.getPersistentData<string>('userNote', '')
      .subscribe(note => {
        this.noteControl.setValue(note);
      });
    
    // Get last visit time
    const now = new Date().toISOString();
    this.persistentDataService.getPersistentData<string>('lastVisitTime')
      .subscribe(time => {
        this.lastVisit = time;
        // Update last visit time to now
        this.persistentDataService.updatePersistentData('lastVisitTime', now);
      });
  }
  
  savePreferences(): void {
    const preferences = this.preferencesForm.value as UserPreferences;
    this.persistentDataService.updatePersistentData('userPreferences', preferences);
    alert('Preferences saved! They will persist even if you close the browser.');
  }
  
  saveNote(): void {
    const note = this.noteControl.value || '';
    this.persistentDataService.updatePersistentData('userNote', note);
    alert('Note saved! It will persist even if you close the browser.');
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
