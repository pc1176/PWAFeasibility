import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import Hls from 'hls.js';
import { API_ENDPOINTS } from '../../../../core/config/endpoints';

@Component({
  selector: 'app-video-layout',
  standalone: true,
  imports: [CommonModule, IconDirective],
  templateUrl: './video-layout.component.html',
  styleUrls: ['./video-layout.component.scss'],
})
export class VideoLayoutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  dropdownOpen: boolean = false;
  isInitialized: boolean = false;
  deviceId: Number | undefined;
  cameraId: Number | undefined;

  metadata = [
    {
      eventCode: 1,
      coordinates: { x: 100, y: 50, width: 150, height: 100 },
      timestamp: '5', //sec
      duration: 5, //sec
    },
    {
      eventCode: 1,
      coordinates: { x: 300, y: 100, width: 100, height: 150 },
      timestamp: '25', //sec
      duration: 4, //sec
    },
  ];

  speeds = [
    { id: 'normal-speed-btn', value: 1.0, label: '1x', class: 'btn-dark' },
    { id: 'speed-2x-btn', value: 2.0, label: '2x', class: 'btn-dark' },
    { id: 'speed-4x-btn', value: 4.0, label: '4x', class: 'btn-dark' },
    { id: 'speed-8x-btn', value: 8.0, label: '8x', class: 'btn-dark' },
    { id: 'speed-16x-btn', value: 16.0, label: '16x', class: 'btn-dark' },
  ];

  private animationFrameId: number | null = null;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.setupCanvas();
    this.updateCanvas();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  setupCanvas(): void {
    const canvas = this.canvasElement.nativeElement;
    const video = this.videoElement.nativeElement;

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    // Listen for time updates
    video.addEventListener('timeupdate', this.updateCanvas.bind(this));
  }

  updateCanvas(): void {
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    const video = this.videoElement.nativeElement;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const draw = () => {
      const currentTime = video.currentTime;

      this.metadata.forEach((item) => {
        const startTime = parseFloat(item.timestamp);
        const endTime = startTime + item.duration;

        if (currentTime >= startTime && currentTime <= endTime) {
          context.strokeStyle = 'red';
          context.lineWidth = 2;
          context.strokeRect(
            item.coordinates.x,
            item.coordinates.y,
            item.coordinates.width,
            item.coordinates.height
          );
        }
      });

      this.animationFrameId = requestAnimationFrame(draw);
    };

    draw();
  }

  preventDefault(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const data = event.dataTransfer?.getData('text/plain');
    if (data) {
      const hashIndex = data.indexOf('#');
      if (hashIndex !== -1) {
        const fragment = data.substring(hashIndex + 1);
        const urlParts = fragment.split('?');

        if (urlParts.length > 1) {
          const queryParams = new URLSearchParams(urlParts[1]);
          const deviceId = queryParams.get('deviceId');
          const cameraId = queryParams.get('cameraId');

          if (deviceId && cameraId) {
            this.deviceId = +deviceId;
            this.cameraId = +cameraId;
            this.initializeHLS(API_ENDPOINTS.PLAYBACK_URL);
            this.videoElement.nativeElement.controls = true;
          } else {
            console.error('Failed to retrieve deviceId or cameraId');
          }
        }
      } else {
        console.error('Hash not found in URL');
      }
    }
  }

  initializeHLS(url: string): void {
    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 5,
        maxBufferSize: 20 * 1000 * 1000,
      });
      hls.loadSource(url);
      hls.attachMedia(this.videoElement.nativeElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.videoElement.nativeElement.play();
        this.isInitialized = true;
      }
      );
    } else if (
      this.videoElement.nativeElement.canPlayType(
        'application/vnd.apple.mpegurl'
      )
    ) {
      this.videoElement.nativeElement.src = url;
      this.videoElement.nativeElement.addEventListener('loadedmetadata', () => {
        this.videoElement.nativeElement.play();
        this.isInitialized = true;
      }
      );
    } else {
      console.error('HLS.js is not supported in this browser.');
    }
  }

  play(): void {
    if (this.isInitialized) {
      this.videoElement.nativeElement.play();
    }
  }

  pause(): void {
    if (this.isInitialized) {
      this.videoElement.nativeElement.pause();
    }
  }

  stop(): void {
    if (this.isInitialized) {
      const video = this.videoElement.nativeElement;
      video.pause();
      video.currentTime = 0;
    }
  }

  reverse(): void {
    if (this.isInitialized) {
      const video = this.videoElement.nativeElement;
      video.currentTime = Math.max(video.currentTime - 5, 0);
    }
  }

  mute(): void {
    if (this.isInitialized) {
      const video = this.videoElement.nativeElement;
      video.muted = !video.muted;
    }
  }

  setVolume(event: any) {
    if (this.isInitialized) {
      const video = this.videoElement.nativeElement;
      video.volume = event.target.value;
    }
  }

  changePlaybackSpeed(speed: number): void {
    if (this.isInitialized) {
      this.videoElement.nativeElement.playbackRate = speed;
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  switchToLiveView(): void {
    if (this.deviceId && this.cameraId) {
      this.router.navigate(['/videoPlayer'], {
        queryParams: {
          deviceId: this.deviceId,
          cameraId: this.cameraId,
        },
      });
    }
  }
}
