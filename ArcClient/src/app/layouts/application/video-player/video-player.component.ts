import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { VideoPlayerService } from './video-player.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { NavLinkDirective } from '@coreui/angular';
import { API_ENDPOINTS } from '../../../core/config/endpoints';
declare var Hls: any;

interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
  credentialType?: 'password';
}

interface ParsedOffer {
  iceUfrag: string;
  icePwd: string;
  medias: string[];
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, IconDirective, NavLinkDirective],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent implements OnInit, OnDestroy {

  loading: boolean = false;
  isPlaying = false;
  isHLS: boolean = true;
  video: HTMLVideoElement = document.getElementById('video') as HTMLVideoElement;
  private deviceId!: number;
  private cameraId!: number;
  private webRTCURL: string = '';
  private hlsURL: string = '';
  private streamURL: string = '';
  private retryPause: number = 2000;
  private message: HTMLElement = document.getElementById('message') as HTMLElement;
  private nonAdvertisedCodecs: string[] = [];
  private pc: RTCPeerConnection | null = null;
  private restartTimeout: number | null = null;
  private sessionUrl: string = '';
  private offerData: any = '';
  private queuedCandidates: RTCIceCandidate[] = [];
  private defaultControls: boolean = false;
  private searchParmas: string = '';

  constructor(
    private videoPlayerService: VideoPlayerService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe((params : any) => {
      this.deviceId = +params['deviceId']; // Convert to number
      this.cameraId = +params['cameraId']; // Convert to number
      if (Number.isNaN(this.deviceId) || Number.isNaN(this.cameraId)) {
        this.toastr.error('Invalid PageURL.');
        this.router.navigate(['/dashboard']);
      }

      // this.loading = false;
      // this.webRTCURL = 'http://192.168.27.169:8889/live1/';
      // // http://192.168.27.169:8889/live1/
      // this.startVideoStream();

      this.loading = true;
      this.videoPlayerService.getWebRtcUrl(this.deviceId, this.cameraId)
      .subscribe((response) => {
        if (response.status === 200) {
          this.streamURL = response.data + "/";
          this.loading = false;
          this.webRTCURL = this.streamURL.replace(":8889", "");
          this.webRTCURL = this.webRTCURL.replace(API_ENDPOINTS.MEDIAMTX_URL, API_ENDPOINTS.WEBRTC_BASE_URL);
          this.startVideoStream();
        } else {
          this.toastr.error(response.message || "Please try again later.");
        }
      },
      (error) => {
        if (error.status === 0) {
          this.toastr.error('Server is currently offline. Please try again later.');
        } else {
          this.toastr.error(error?.error?.message || 'Please try again later.');
        }
      });
    });

  }

  ngOnDestroy(): void {
    this.stopVideoStream();
  }

  updateStreamFormat(event: Event): void {
    const selectedFormat = (event.target as HTMLSelectElement).value;
    console.log('Selected format:', selectedFormat);

    if (selectedFormat === '0') {
      this.isHLS = true;
      this.stopVideoStream();
      this.startVideoStream();
    } else if (selectedFormat === '1') {
      this.isHLS = false;
      this.stopVideoStream();
      this.startVideoStream();
    }
  }

  toggleFullscreen(): void {
    const element = this.video;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      element.requestFullscreen().catch((err: any) => console.error("Error trying to enable fullscreen mode:", err));
    }
  }

  startVideoStream() : void
  {
    this.video = document.getElementById('video') as HTMLVideoElement;
    this.message = document.getElementById('message') as HTMLElement;
    this.getNonAdvertisedCodecs();

    this.video.oncanplay = () => {
      this.loading = false;
    };
    this.video.onpause = () => {
      this.isPlaying = false;
    };
    this.video.onplay = () => {
      this.isPlaying = true;
    };
  }

  stopVideoStream(): void {
    if (this.pc) {
      this.video.srcObject = null;
      this.pc.close();
      this.pc = null;
    }
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
  }

  //#region Control Events

  playVideo() {
    this.video.play();
    this.isPlaying = true;
  }

  stopVideo() {
    this.video.pause();
    this.video.currentTime = 0;
    this.isPlaying = false;
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
  }

  setVolume(event: any) {
    this.video.volume = event.target.value;
  }

  async togglePIP() {
    if (this.video !== document.pictureInPictureElement) {
      try {
        await this.video.requestPictureInPicture();
      } catch (error) {
        console.error(error);
      }
    } else {
      await document.exitPictureInPicture();
    }
  }

  //#endregion

  setMessage = (str: string): void => {
    if (str !== '') {
      this.video.controls = false;
    } else {
      this.video.controls = this.defaultControls;
    }
    this.message.innerText = str;
  }

  unquoteCredential = (v: string): any => (
    JSON.parse(`"${v}"`)
  );

  linkToIceServers = (links: string | null): any[] => (
    (links !== null) ? links.split(', ').map((link) => {
      const m = link.match(/^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i);

      if(m === null) return;

      const ret : IceServer = {
        urls: [m[1]],
      };

      if (m[3] !== undefined) {
        ret.username = this.unquoteCredential(m[3]);
        ret.credential = this.unquoteCredential(m[4]);
        ret.credentialType = 'password';
      }

      return ret;
    }) : []
  );

  parseOffer = (sdp: string): any => {

    // console.log("parseOffer", sdp);
    const ret : ParsedOffer = {
      iceUfrag: '',
      icePwd: '',
      medias: [],
    };

    for (const line of sdp.split('\r\n')) {
      if (line.startsWith('m=')) {
        ret.medias.push(line.slice('m='.length));
      } else if (ret.iceUfrag === '' && line.startsWith('a=ice-ufrag:')) {
        ret.iceUfrag = line.slice('a=ice-ufrag:'.length);
      } else if (ret.icePwd === '' && line.startsWith('a=ice-pwd:')) {
        ret.icePwd = line.slice('a=ice-pwd:'.length);
      }
    }

    return ret;
  }

  enableStereoPcmau = (section: string): string => {
    let lines: string[] = section.split('\r\n');

    lines[0] += ' 118';
    lines.splice(lines.length - 1, 0, 'a=rtpmap:118 PCMU/8000/2');
    lines.splice(lines.length - 1, 0, 'a=rtcp-fb:118 transport-cc');

    lines[0] += ' 119';
    lines.splice(lines.length - 1, 0, 'a=rtpmap:119 PCMA/8000/2');
    lines.splice(lines.length - 1, 0, 'a=rtcp-fb:119 transport-cc');

    return lines.join('\r\n');
  }

  enableMultichannelOpus = (section: string): string => {
    let lines: string[] = section.split('\r\n');

    lines[0] += " 112";
    lines.splice(lines.length - 1, 0, "a=rtpmap:112 multiopus/48000/3");
    lines.splice(lines.length - 1, 0, "a=fmtp:112 channel_mapping=0,2,1;num_streams=2;coupled_streams=1");
    lines.splice(lines.length - 1, 0, "a=rtcp-fb:112 transport-cc");

    lines[0] += " 113";
    lines.splice(lines.length - 1, 0, "a=rtpmap:113 multiopus/48000/4");
    lines.splice(lines.length - 1, 0, "a=fmtp:113 channel_mapping=0,1,2,3;num_streams=2;coupled_streams=2");
    lines.splice(lines.length - 1, 0, "a=rtcp-fb:113 transport-cc");

    lines[0] += " 114";
    lines.splice(lines.length - 1, 0, "a=rtpmap:114 multiopus/48000/5");
    lines.splice(lines.length - 1, 0, "a=fmtp:114 channel_mapping=0,4,1,2,3;num_streams=3;coupled_streams=2");
    lines.splice(lines.length - 1, 0, "a=rtcp-fb:114 transport-cc");

    lines[0] += " 115";
    lines.splice(lines.length - 1, 0, "a=rtpmap:115 multiopus/48000/6");
    lines.splice(lines.length - 1, 0, "a=fmtp:115 channel_mapping=0,4,1,2,3,5;num_streams=4;coupled_streams=2");
    lines.splice(lines.length - 1, 0, "a=rtcp-fb:115 transport-cc");

    lines[0] += " 116";
    lines.splice(lines.length - 1, 0, "a=rtpmap:116 multiopus/48000/7");
    lines.splice(lines.length - 1, 0, "a=fmtp:116 channel_mapping=0,4,1,2,3,5,6;num_streams=4;coupled_streams=4");
    lines.splice(lines.length - 1, 0, "a=rtcp-fb:116 transport-cc");

    lines[0] += " 117";
    lines.splice(lines.length - 1, 0, "a=rtpmap:117 multiopus/48000/8");
    lines.splice(lines.length - 1, 0, "a=fmtp:117 channel_mapping=0,6,1,4,5,2,3,7;num_streams=5;coupled_streams=4");
    lines.splice(lines.length - 1, 0, "a=rtcp-fb:117 transport-cc");

    return lines.join('\r\n');
  }

  enableL16 = (section: string): string => {
    let lines: string[] = section.split('\r\n');

    lines[0] += " 120";
    lines.splice(lines.length - 1, 0, "a=rtpmap:120 L16/8000/2");
    lines.splice(lines.length - 1, 0, "a=rtcp-fb:120 transport-cc");

    lines[0] += " 121";
    lines.splice(lines.length - 1, 0, "a=rtpmap:121 L16/16000/2");
    lines.splice(lines.length - 1, 0, "a=rtcp-fb:121 transport-cc");

    lines[0] += " 122";
    lines.splice(lines.length - 1, 0, "a=rtpmap:122 L16/48000/2");
    lines.splice(lines.length - 1, 0, "a=rtcp-fb:122 transport-cc");

    return lines.join('\r\n');
  }

  enableStereoOpus = (section: string): string => {
    let opusPayloadFormat = '';
    let lines: string[] = section.split('\r\n');

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('a=rtpmap:') && lines[i].toLowerCase().includes('opus/')) {
        opusPayloadFormat = lines[i].slice('a=rtpmap:'.length).split(' ')[0];
        break;
      }
    }

    if (opusPayloadFormat === '') {
      return section;
    }

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('a=fmtp:' + opusPayloadFormat + ' ')) {
        if (!lines[i].includes('stereo')) {
          lines[i] += ';stereo=1';
        }
        if (!lines[i].includes('sprop-stereo')) {
          lines[i] += ';sprop-stereo=1';
        }
      }
    }

    return lines.join('\r\n');
  }

  editOffer = (sdp: string): string => {
    const sections: string[] = sdp.split('m=');

    for (let i = 0; i < sections.length; i++) {
      if (sections[i].startsWith('audio')) {
        sections[i] = this.enableStereoOpus(sections[i]);

        if (this.nonAdvertisedCodecs.includes('pcma/8000/2')) {
          sections[i] = this.enableStereoPcmau(sections[i]);
        }

        if (this.nonAdvertisedCodecs.includes('multiopus/48000/6')) {
          sections[i] = this.enableMultichannelOpus(sections[i]);
        }

        if (this.nonAdvertisedCodecs.includes('L16/48000/2')) {
          sections[i] = this.enableL16(sections[i]);
        }

        break;
      }
    }

    return sections.join('m=');
  }

  generateSdpFragment = (od: any, candidates: RTCIceCandidate[]): string => {
    const candidatesByMedia: { [key: number]: RTCIceCandidate[] } = {};
    for (const candidate of candidates) {
      const mid = candidate.sdpMLineIndex;
      if(mid !== null)
      {
        if (candidatesByMedia[mid] === undefined) {
          candidatesByMedia[mid] = [];
        }
        candidatesByMedia[mid].push(candidate);
      }
    }

    let frag = 'a=ice-ufrag:' + od.iceUfrag + '\r\n'
      + 'a=ice-pwd:' + od.icePwd + '\r\n';

    let mid = 0;

    for (const media of od.medias) {
      if (candidatesByMedia[mid] !== undefined) {
        frag += 'm=' + media + '\r\n'
          + 'a=mid:' + mid + '\r\n';

        for (const candidate of candidatesByMedia[mid]) {
          frag += 'a=' + candidate.candidate + '\r\n';
        }
      }
      mid++;
    }

    return frag;
  };

  loadStream = (): void => {
    if (this.isHLS === true)
    {
      this.hlsURL = this.streamURL.replace(':8889', '');
      this.hlsURL = this.hlsURL.replace(API_ENDPOINTS.MEDIAMTX_URL, API_ENDPOINTS.HLS_BASE_URL);

      // this.hlsURL = "http://hls-streams/matrixcamera/";
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxLiveSyncPlaybackRate: 1.5,
        });

        hls.on(Hls.Events.ERROR, (evt: any, data: any) => {
          if (data.fatal) {
            hls.destroy();

            if (data.details === 'manifestIncompatibleCodecsError') {
              this.setMessage('stream makes use of codecs which are incompatible with this browser or operative system');
            } else if (data.response && data.response.code === 404) {
              this.setMessage('stream not found, retrying in some seconds');
            } else {
              this.setMessage(data.error + ', retrying in some seconds');
            }

            setTimeout(() => this.loadStream(), this.retryPause);
          }
        });

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(this.hlsURL + 'index.m3u8');
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.setMessage('');
          this.video.play();
        });

        hls.attachMedia(this.video);

      } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        fetch(this.hlsURL + 'index.m3u8')
          .then(() => {
            this.video.src = this.hlsURL + 'index.m3u8';
            this.video.play();
          });
      }
    }
    else // webrtc
    {
      this.requestICEServers();
    }
  }

  supportsNonAdvertisedCodec = (codec: string, fmtp: string | undefined): Promise<boolean> => (
    new Promise((resolve, reject) => {
      const pc = new RTCPeerConnection({ iceServers:  [{ "urls": "stun:stun2.1.google.com:19302" }] });
      pc.addTransceiver('audio', { direction: 'recvonly' });
      pc.createOffer()
        .then((offer) => {
          if (offer.sdp?.includes(' ' + codec)) { // codec is advertised, there's no need to add it manually
            resolve(false);
            return;
          }
          const sections = offer.sdp?.split('m=audio');
          if (sections !== undefined)
          {
            const lines = sections[1].split('\r\n');
            lines[0] += ' 118';
            lines.splice(lines.length - 1, 0, 'a=rtpmap:118 ' + codec);
            if (fmtp !== undefined) {
              lines.splice(lines.length - 1, 0, 'a=fmtp:118 ' + fmtp);
            }
            sections[1] = lines.join('\r\n');
            offer.sdp = sections.join('m=audio');
          }
          return pc.setLocalDescription(offer);
        })
        .then(() => {
          return pc.setRemoteDescription(new RTCSessionDescription({
            type: 'answer',
            sdp: 'v=0\r\n'
            + 'o=- 6539324223450680508 0 IN IP4 0.0.0.0\r\n'
            + 's=-\r\n'
            + 't=0 0\r\n'
            + 'a=fingerprint:sha-256 0D:9F:78:15:42:B5:4B:E6:E2:94:3E:5B:37:78:E1:4B:54:59:A3:36:3A:E5:05:EB:27:EE:8F:D2:2D:41:29:25\r\n'
            + 'm=audio 9 UDP/TLS/RTP/SAVPF 118\r\n'
            + 'c=IN IP4 0.0.0.0\r\n'
            + 'a=ice-pwd:7c3bf4770007e7432ee4ea4d697db675\r\n'
            + 'a=ice-ufrag:29e036dc\r\n'
            + 'a=sendonly\r\n'
            + 'a=rtcp-mux\r\n'
            + 'a=rtpmap:118 ' + codec + '\r\n'
            + ((fmtp !== undefined) ? 'a=fmtp:118 ' + fmtp + '\r\n' : ''),
          }));
        })
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          resolve(false);
        })
        .finally(() => {
          pc.close();
        });
    })
  );

  getNonAdvertisedCodecs = (): void => {
    Promise.all([
      ['pcma/8000/2'],
      ['multiopus/48000/6', 'channel_mapping=0,4,1,2,3,5;num_streams=4;coupled_streams=2'],
      ['L16/48000/2']
    ].map((c) => this.supportsNonAdvertisedCodec(c[0], c[1]).then((r) => (r) ? c[0] : false)))
      .then((c) => c.filter((e) => e !== false))
      .then((codecs) => {
        // console.log(codecs);
        this.nonAdvertisedCodecs = codecs;
        this.loadStream();
      });
  }

  onError = (err: string): void => {
    if (this.restartTimeout === null) {
      this.setMessage(err + ', retrying in some seconds');

      if (this.pc !== null) {
        this.pc.close();
        this.pc = null;
      }

      this.restartTimeout = window.setTimeout(() => {
        this.restartTimeout = null;
        this.loadStream();
      }, this.retryPause);

      if (this.sessionUrl) {
        fetch(this.sessionUrl, {
          method: 'DELETE',
        });
      }
      this.sessionUrl = '';

      this.queuedCandidates = [];
    }
  }

  sendLocalCandidates = (candidates: RTCIceCandidate[]): void => {
    fetch(this.sessionUrl + this.searchParmas, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/trickle-ice-sdpfrag',
        'If-Match': '*',
      },
      body: this.generateSdpFragment(this.offerData, candidates),
    })
      .then((res) => {
        switch (res.status) {
        case 204:
          break;
        case 404:
          throw new Error('stream not found');
        default:
          throw new Error(`bad status code ${res.status}`);
        }
      })
      .catch((err) => {
        this.onError(err.toString());
      });
  }

  onLocalCandidate = (evt: RTCPeerConnectionIceEvent): void => {
    if (this.restartTimeout !== null) {
      return;
    }

    if (evt.candidate !== null) {
      if (this.sessionUrl === '') {
        this.queuedCandidates.push(evt.candidate);
      } else {
        this.sendLocalCandidates([evt.candidate])
      }
    }
  }

  onRemoteAnswer = (sdp: string): void => {
    if (this.restartTimeout !== null) {
      return;
    }

    this.pc?.setRemoteDescription(new RTCSessionDescription({
      type: 'answer',
      sdp,
    }))
      .then(() => {
        if (this.queuedCandidates.length !== 0) {
          this.sendLocalCandidates(this.queuedCandidates);
          this.queuedCandidates = [];
        }
      })
      .catch((err) => {
        this.onError(err.toString());
      });
  }

  sendOffer = (offer: RTCSessionDescriptionInit): void => {
    fetch(new URL('whep', this.webRTCURL) + this.searchParmas, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        'Authorization': 'Basic ' + btoa('dkp:dkp')
      },
      body: offer.sdp,
    })
      .then((res) => {
        switch (res.status) {
        case 201:
          break;
        case 404:
          throw new Error('stream not found');
        case 400:
          return res.json().then((e) => { throw new Error(e.error); });
        default:
          throw new Error(`bad status code ${res.status}`);
        }
        // console.log(res);
        this.sessionUrl = new URL(res.headers.get('location') ?? '', this.webRTCURL).toString();

        return res.text()
          .then((sdp) => {
            // console.log(sdp);
            return this.onRemoteAnswer(sdp);
          });
      })
      .catch((err) => {
        this.onError(err.toString());
      });
  };

  createOffer = (): void => {
    this.pc?.createOffer()
      .then((offer) => {
        // console.log(offer.sdp);
        offer.sdp = this.editOffer(offer.sdp ?? '');
        this.offerData = this.parseOffer(offer.sdp);
        this.pc?.setLocalDescription(offer)
          .then(() => {
            this.sendOffer(offer);
          })
          .catch((err) => {
            this.onError(err.toString());
          });
      })
      .catch((err) => {
        this.onError(err.toString());
      });
  }

  onConnectionState = (): void => {
    if (this.restartTimeout !== null) {
      return;
    }

    if (this.pc?.iceConnectionState === 'disconnected') {
      this.onError('peer connection closed');
    }
  }

  onTrack = (evt: RTCTrackEvent): void => {
    this.setMessage('');
    this.video.srcObject = evt.streams[0];

    // this.pc?.getStats().then(stats => {
    //   stats.forEach(report => {
    //     console.log(report.type, report);
    //   });
    // });

    // const mediaRecorder = new MediaRecorder(evt.streams[0]);

    // mediaRecorder.ondataavailable = (event) => {
    //   console.log('Data available:', event.data);
    // };
    // mediaRecorder.onerror = (err) => {
    //   console.log('Error available:', err);
    // };

    // mediaRecorder.start(1000);
  }

  requestICEServers = (): void => {
    fetch(new URL('whep', this.webRTCURL) + this.searchParmas, {
      method: 'OPTIONS',
    })
      .then((res) => {
        const hasSdpSemantics = 'sdpSemantics' in RTCPeerConnection.prototype;

        const config: RTCConfiguration = {
          iceServers: this.linkToIceServers(res.headers.get('Link')),
        };

        if (hasSdpSemantics) {
          (config as any).sdpSemantics = 'unified-plan';
        }

        this.pc = new RTCPeerConnection(config);

        const direction = 'sendrecv';
        this.pc.addTransceiver('video', { direction });
        this.pc.addTransceiver('audio', { direction });

        this.pc.onicecandidate = (evt) => this.onLocalCandidate(evt);
        this.pc.oniceconnectionstatechange = () => this.onConnectionState();
        this.pc.ontrack = (evt) => this.onTrack(evt);

        this.createOffer();
      })
      .catch((err) => {
        this.onError(err.toString());
      });
  }

  parseBoolString = (str: string | null, defaultVal: boolean): boolean => {
    str = (str || '');

    if (['1', 'yes', 'true'].includes(str.toLowerCase())) {
      return true;
    }
    if (['0', 'no', 'false'].includes(str.toLowerCase())) {
      return false;
    }
    return defaultVal;
  }

}
