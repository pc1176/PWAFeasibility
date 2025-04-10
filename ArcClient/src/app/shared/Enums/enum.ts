//#region HttpStatusCode

export enum HttpStatusCode {
    Continue = 100,
    SwitchingProtocols = 101,
    Processing = 102,
    OK = 200,
    Created = 201,
    Accepted = 202,
    NonAuthoritativeInformation = 203,
    NoContent = 204,
    ResetContent = 205,
    PartialContent = 206,
    MultiStatus = 207,
    AlreadyReported = 208,
    IMUsed = 226,
    MultipleChoices = 300,
    MovedPermanently = 301,
    Found = 302,
    SeeOther = 303,
    NotModified = 304,
    UseProxy = 305,
    SwitchProxy = 306,
    TemporaryRedirect = 307,
    PermanentRedirect = 308,
    BadRequest = 400,
    Unauthorized = 401,
    PaymentRequired = 402,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    NotAcceptable = 406,
    ProxyAuthenticationRequired = 407,
    RequestTimeout = 408,
    Conflict = 409,
    Gone = 410,
    LengthRequired = 411,
    PreconditionFailed = 412,
    PayloadTooLarge = 413,
    URITooLong = 414,
    UnsupportedMediaType = 415,
    RangeNotSatisfiable = 416,
    ExpectationFailed = 417,
    ImATeapot = 418,
    MisdirectedRequest = 421,
    UnprocessableEntity = 422,
    Locked = 423,
    FailedDependency = 424,
    TooEarly = 425,
    UpgradeRequired = 426,
    PreconditionRequired = 428,
    TooManyRequests = 429,
    RequestHeaderFieldsTooLarge = 431,
    UnavailableForLegalReasons = 451,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
    HTTPVersionNotSupported = 505,
    VariantAlsoNegotiates = 506,
    InsufficientStorage = 507,
    LoopDetected = 508,
    NotExtended = 510,
    NetworkAuthenticationRequired = 511
}

export const HttpStatusCodeDescriptions = {
    [HttpStatusCode.Continue]: 'Continue',
    [HttpStatusCode.SwitchingProtocols]: 'Switching Protocols',
    [HttpStatusCode.Processing]: 'Processing',
    [HttpStatusCode.OK]: 'OK',
    [HttpStatusCode.Created]: 'Created',
    [HttpStatusCode.Accepted]: 'Accepted',
    [HttpStatusCode.NonAuthoritativeInformation]: 'Non-Authoritative Information',
    [HttpStatusCode.NoContent]: 'No Content',
    [HttpStatusCode.ResetContent]: 'Reset Content',
    [HttpStatusCode.PartialContent]: 'Partial Content',
    [HttpStatusCode.MultiStatus]: 'Multi-Status',
    [HttpStatusCode.AlreadyReported]: 'Already Reported',
    [HttpStatusCode.IMUsed]: 'IM Used',
    [HttpStatusCode.MultipleChoices]: 'Multiple Choices',
    [HttpStatusCode.MovedPermanently]: 'Moved Permanently',
    [HttpStatusCode.Found]: 'Found',
    [HttpStatusCode.SeeOther]: 'See Other',
    [HttpStatusCode.NotModified]: 'Not Modified',
    [HttpStatusCode.UseProxy]: 'Use Proxy',
    [HttpStatusCode.SwitchProxy]: 'Switch Proxy',
    [HttpStatusCode.TemporaryRedirect]: 'Temporary Redirect',
    [HttpStatusCode.PermanentRedirect]: 'Permanent Redirect',
    [HttpStatusCode.BadRequest]: 'Bad Request',
    [HttpStatusCode.Unauthorized]: 'Unauthorized',
    [HttpStatusCode.PaymentRequired]: 'Payment Required',
    [HttpStatusCode.Forbidden]: 'Forbidden',
    [HttpStatusCode.NotFound]: 'Not Found',
    [HttpStatusCode.MethodNotAllowed]: 'Method Not Allowed',
    [HttpStatusCode.NotAcceptable]: 'Not Acceptable',
    [HttpStatusCode.ProxyAuthenticationRequired]: 'Proxy Authentication Required',
    [HttpStatusCode.RequestTimeout]: 'Request Timeout',
    [HttpStatusCode.Conflict]: 'Conflict',
    [HttpStatusCode.Gone]: 'Gone',
    [HttpStatusCode.LengthRequired]: 'Length Required',
    [HttpStatusCode.PreconditionFailed]: 'Precondition Failed',
    [HttpStatusCode.PayloadTooLarge]: 'Payload Too Large',
    [HttpStatusCode.URITooLong]: 'URI Too Long',
    [HttpStatusCode.UnsupportedMediaType]: 'Unsupported Media Type',
    [HttpStatusCode.RangeNotSatisfiable]: 'Range Not Satisfiable',
    [HttpStatusCode.ExpectationFailed]: 'Expectation Failed',
    [HttpStatusCode.ImATeapot]: "I'm a teapot",
    [HttpStatusCode.MisdirectedRequest]: 'Misdirected Request',
    [HttpStatusCode.UnprocessableEntity]: 'Unprocessable Entity',
    [HttpStatusCode.Locked]: 'Locked',
    [HttpStatusCode.FailedDependency]: 'Failed Dependency',
    [HttpStatusCode.TooEarly]: 'Too Early',
    [HttpStatusCode.UpgradeRequired]: 'Upgrade Required',
    [HttpStatusCode.PreconditionRequired]: 'Precondition Required',
    [HttpStatusCode.TooManyRequests]: 'Too Many Requests',
    [HttpStatusCode.RequestHeaderFieldsTooLarge]: 'Request Header Fields Too Large',
    [HttpStatusCode.UnavailableForLegalReasons]: 'Unavailable For Legal Reasons',
    [HttpStatusCode.InternalServerError]: 'Internal Server Error',
    [HttpStatusCode.NotImplemented]: 'Not Implemented',
    [HttpStatusCode.BadGateway]: 'Bad Gateway',
    [HttpStatusCode.ServiceUnavailable]: 'Service Unavailable',
    [HttpStatusCode.GatewayTimeout]: 'Gateway Timeout',
    [HttpStatusCode.HTTPVersionNotSupported]: 'HTTP Version Not Supported',
    [HttpStatusCode.VariantAlsoNegotiates]: 'Variant Also Negotiates',
    [HttpStatusCode.InsufficientStorage]: 'Insufficient Storage',
    [HttpStatusCode.LoopDetected]: 'Loop Detected',
    [HttpStatusCode.NotExtended]: 'Not Extended',
    [HttpStatusCode.NetworkAuthenticationRequired]: 'Network Authentication Required'
};

//#endregion

//#region DeviceType 

export enum DeviceType {
    IpCamera = 1,
    NVR = 2
}

export const DeviceTypeDescriptions = {
    [DeviceType.IpCamera]: 'IP Camera',
    [DeviceType.NVR]: 'NVR'
};

//#endregion

//#region ConnectionType

export enum ConnectionType {
    Ip = 1,
    HostName = 2,
    MacAddress = 3
}

export const ConnectionTypeDescriptions = {
    [ConnectionType.Ip]: 'Ip or Server Name',
    [ConnectionType.HostName]: 'Matrix DNS - Host Name',
    [ConnectionType.MacAddress]: 'Matrix DNS - MAC Address'
};

//#endregion

//#region DeviceStatus

export enum DeviceStatus {
    Enabled = 1,
    Disabled = 2,
    Undermaintainance = 3
}

export const DeviceStatusDescriptions = {
    [DeviceStatus.Enabled]: 'Enabled',
    [DeviceStatus.Disabled]: 'Disabled',
    [DeviceStatus.Undermaintainance]: 'Undermaintainance'
};

//#endregion

//#region ComponentType

export enum ComponentType {
    Alarm = 1,
    Camera = 2,
    Sensor = 3
}

export const ComponentTypeDescriptions = {
    [ComponentType.Alarm]: 'Alarm',
    [ComponentType.Camera]: 'Camera',
    [ComponentType.Sensor]: 'Sensor'
};

//#endregion

//#region VideoCodec

export enum VideoCodec {
    H264 = 1,
    H265 = 2,
    MJPEG = 3
}

export const VideoCodecDescriptions = {
    [VideoCodec.H264]: 'H.264',
    [VideoCodec.H265]: 'H.265',
    [VideoCodec.MJPEG]: 'MJPEG'
};

//#endregion

//#region VideoResolution

export enum VideoResolution {
    QQVGA = 0,
    QVGA = 1,
    VGA = 2,
    SD = 3,
    HD = 4,
    FullHD = 5,
    QHD = 6,
    UHD = 7,
    UHD8K = 8,
    _2K = 9,
    _4KCinema = 10,
    _8KCinema = 11
}

export const VideoResolutionDescriptions = {
    [VideoResolution.QQVGA]: '160x120',
    [VideoResolution.QVGA]: '320x240',
    [VideoResolution.VGA]: '640x480',
    [VideoResolution.SD]: '720x480',
    [VideoResolution.HD]: '1280x720',
    [VideoResolution.FullHD]: '1920x1080',
    [VideoResolution.QHD]: '2560x1440',
    [VideoResolution.UHD]: '3840x2160',
    [VideoResolution.UHD8K]: '7680x4320',
    [VideoResolution._2K]: '2048x1080',
    [VideoResolution._4KCinema]: '4096x2160',
    [VideoResolution._8KCinema]: '8192x4320'
};

//#endregion

//#region AudioCodec

export enum AudioCodec {
    MP3 = 1,
    AAC = 2,
    OggVorbis = 3,
    WMA = 4,
    Opus = 5,
    FLAC = 6,
    ALAC = 7,
    WAV = 8,
    AIFF = 9,
    APE = 10,
    G711 = 11,
    G722 = 12,
    G726 = 13,
    G729 = 14,
    AC3 = 15,
    DTS = 16,
    Vorbis = 17,
    AMR = 18
}

export const AudioCodecDescriptions = {
    [AudioCodec.MP3]: 'MP3 - MPEG Layer 3',
    [AudioCodec.AAC]: 'AAC - Advanced Audio Coding',
    [AudioCodec.OggVorbis]: 'Ogg Vorbis',
    [AudioCodec.WMA]: 'WMA - Windows Media Audio',
    [AudioCodec.Opus]: 'Opus',
    [AudioCodec.FLAC]: 'FLAC - Free Lossless Audio Codec',
    [AudioCodec.ALAC]: 'ALAC - Apple Lossless Audio Codec',
    [AudioCodec.WAV]: 'WAV - Waveform Audio File Format',
    [AudioCodec.AIFF]: 'AIFF - Audio Interchange File Format',
    [AudioCodec.APE]: 'APE - Monkey\'s Audio',
    [AudioCodec.G711]: 'G.711',
    [AudioCodec.G722]: 'G.722',
    [AudioCodec.G726]: 'G.726',
    [AudioCodec.G729]: 'G.729',
    [AudioCodec.AC3]: 'AC-3 - Dolby Digital',
    [AudioCodec.DTS]: 'DTS - Digital Theater Systems',
    [AudioCodec.Vorbis]: 'Vorbis',
    [AudioCodec.AMR]: 'AMR - Adaptive Multi-Rate'
};

//#endregion

//#region StreamingBitrate

export enum StreamingBitrate {
    Kbps32 = 32,
    Kbps64 = 64,
    Kbps96 = 96,
    Kbps128 = 128,
    Kbps192 = 192,
    Kbps256 = 256,
    Kbps320 = 320,
    Kbps512 = 512,
    Kbps1000 = 1000,
    Kbps1500 = 1500,
    Kbps2000 = 2000,
    Kbps3000 = 3000,
    Kbps4000 = 4000,
    Kbps5000 = 5000,
    Kbps8000 = 8000,
    Kbps10000 = 10000,
    Kbps15000 = 15000,
    Kbps20000 = 20000
}

export const StreamingBitrateDescriptions = {
    [StreamingBitrate.Kbps32]: '32 kbps - Low quality',
    [StreamingBitrate.Kbps64]: '64 kbps - Low quality',
    [StreamingBitrate.Kbps96]: '96 kbps - Low quality',
    [StreamingBitrate.Kbps128]: '128 kbps - Standard quality',
    [StreamingBitrate.Kbps192]: '192 kbps - Standard quality',
    [StreamingBitrate.Kbps256]: '256 kbps - Standard quality',
    [StreamingBitrate.Kbps320]: '320 kbps - High quality',
    [StreamingBitrate.Kbps512]: '512 kbps - High quality',
    [StreamingBitrate.Kbps1000]: '1000 kbps - High quality',
    [StreamingBitrate.Kbps1500]: '1500 kbps - High quality',
    [StreamingBitrate.Kbps2000]: '2000 kbps - High quality',
    [StreamingBitrate.Kbps3000]: '3000 kbps - Ultra high quality',
    [StreamingBitrate.Kbps4000]: '4000 kbps - Ultra high quality',
    [StreamingBitrate.Kbps5000]: '5000 kbps - Ultra high quality',
    [StreamingBitrate.Kbps8000]: '8000 kbps - Ultra high quality',
    [StreamingBitrate.Kbps10000]: '10000 kbps - Professional quality',
    [StreamingBitrate.Kbps15000]: '15000 kbps - Professional quality',
    [StreamingBitrate.Kbps20000]: '20000 kbps - Professional quality'
};

//#endregion
