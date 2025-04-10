import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {
  private applicationTitle : string = "Matrix SATATYA SAMAS";
  constructor(private titleService: Title) { }

  setTitle(title: string | undefined) {
    if (title === undefined)
    {
      this.titleService.setTitle(this.applicationTitle);
    }
    else
    {
      this.titleService.setTitle(title + " - " + this.applicationTitle);
    }
  }

  getTitle(): string {
    return this.titleService.getTitle();
  }
}
