import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, first, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppUpdateService {

  private updates: SwUpdate;
  private appRef: ApplicationRef;

  constructor(appRef: ApplicationRef, updates: SwUpdate) {
   this.updates = updates;
   this.appRef = appRef;
   this.periodicUpdateCheck();
   this.promptUser();
   this.updateInstallationFailedAction();
  }

  periodicUpdateCheck() {
    // Allow the app to stabilize first, before starting polling for updates
    const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable === true));
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
    everySixHoursOnceAppIsStable$.subscribe(async () => {
      try {
        const updateFound = await this.updates.checkForUpdate();
        console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });
  }

  promptUser() {
    this.updates.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_READY':
          console.log(`New app version ready for use: ${evt.latestVersion}`);
          const updateMessage = `New version available: ${evt.latestVersion}. Would you like to update now?`;
          var updateNowConfirmation = window.confirm(updateMessage);
          if (updateNowConfirmation)
            document.location.reload();
          break;
      }
    });
  }

  updateInstallationFailedAction() {
    this.updates.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_INSTALLATION_FAILED':
          console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
      }
    });
  }

}
