export interface UlApi {
  bearerToken: string;
  notificationsUrl: string;
}

export interface DirectusApi {
  url: string;
  bearerToken: string;
}

export interface KeepAliveOptions {
  keepAlive?: boolean;
  keepAliveMsecs?: number;
  freeSocketTimeout?: number;
  timeout?: number;
  maxSockets?: number;
  maxFreeSockets?: number;
  socketActiveTTL?: number;
}
