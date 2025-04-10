export const API_ENDPOINTS = {
  BASE_URL: 'https://resort-adjustment-contractor-scenarios.trycloudflare.com',
  AUTH: {
    LOGIN: '/api/Auth/login',
    VALIDATE_TOKEN: '/api/Auth/validatetoken',
  },
  DEVICE: {
    ADD: '/api/Device/add',
    GET: '/api/Device/get',
    UPDATE: '/api/Device/update',
    DELETE: '/api/Device/delete',
    GETNAMELIST: '/api/Device/devicecomponent',
  },
  DEVICECOMPONENT: {
    GETBYDEVICE: '/api/Component/get/byDevice',
    GETSTREAMPROFILEBYCOPONENT: '/api/Component/getStreamProfile/byComponent',
  },
  STREAMPROFILE: {
    GETBYCOMPONENT: '/api/Component/getStreamProfiles/byComponent',
    UPDATE: '/api/Component/addUpdateStreamProfile',
  },
  GETWEBRTCURL: '/api/Stream/getstreamurl',
  PushNotifications: {
    RecordToken: '/recordToken',
    SendNotifications: '/sendNotifications'
  },
  HLS_BASE_URL : 'https://egypt-ho-receipt-una.trycloudflare.com',
  WEBRTC_BASE_URL : '10.0.83.188:8889',
  MEDIAMTX_URL : 'mediamtx',
  PLAYBACK_URL : 'http://10.0.83.188:4200/assets/hls/recording1/output.m3u8',
  PN_URL : '',
};