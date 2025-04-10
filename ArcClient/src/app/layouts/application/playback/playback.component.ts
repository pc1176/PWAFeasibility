import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { VideoLayoutComponent } from "./video-layout/video-layout.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-playback',
  standalone: true,
  imports: [VideoLayoutComponent, CommonModule, FormsModule],
  templateUrl: './playback.component.html',
  styleUrl: './playback.component.scss'
})
export class PlaybackComponent {
  @ViewChild('videoGrid') videoGrid!: ElementRef;
  layout: number = 2; // Default to a 2x2 layout

  layoutOptions = [
    { value: 1, label: '1x1 (1 video)' },
    { value: 2, label: '2x2 (4 videos)' },
    { value: 3, label: '3x3 (9 videos)' },
    { value: 4, label: '4x4 (16 videos)' }
  ];

  gridTemplateColumns: string = 'repeat(2, 1fr)';
  gridTemplateRows: string = 'repeat(2, 1fr)';

  get layoutArray(): number[] {
    return new Array(this.layout * this.layout).fill(0).map((_, i) => i);
  }

  updateGrid(): void {
    const columns = Math.sqrt(this.layoutArray.length);
    this.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    this.gridTemplateRows = `repeat(${columns}, 1fr)`;
  }

  toggleFullscreen(): void {
    const element = this.videoGrid.nativeElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      element.requestFullscreen().catch((err: any) => console.error("Error trying to enable fullscreen mode:", err));
    }
  }
}
