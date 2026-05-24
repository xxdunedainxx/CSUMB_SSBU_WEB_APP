export interface BackendConfig {
  host: string;
  port: number;
  appHealthPort: number;
  hostRoute: string;
  ssl: boolean;
}

export interface LoggingConfig {
  level: string;
}

export interface EnvironmentConfig {
  logging: LoggingConfig;
  headers: Record<string, string>;
  backend: BackendConfig;
  dev: {
    mockData: boolean;
  };
}

export interface AppConfigurationOptions {
  env: string;
  version?: string;
  config: EnvironmentConfig;
}

/**
 * General config for client 
 */
export class Configuration {
  public readonly isProd: boolean;
  public readonly version: string;
  public readonly logLevel: string;
  public readonly headers: Record<string, string>;
  public readonly remoteHost: string;
  public readonly remoteHostPort: number;
  public readonly remoteHostProtocol: 'http' | 'https';
  public readonly remoteHostHealthPort: number;
  public readonly remoteHostPath: string;
  public readonly remoteEndpoint: string;
  public readonly healthEndpoint: string;
  public readonly mockData: boolean;

  constructor(options: AppConfigurationOptions) {
    const { env, version = '0.0.1', config } = options;

    this.isProd = env === 'prod';
    this.version = version;
    this.logLevel = config.logging.level;
    this.headers = config.headers;

    this.remoteHost = config.backend.host;
    this.remoteHostPort = config.backend.port;
    this.remoteHostHealthPort = config.backend.appHealthPort;
    this.remoteHostPath = config.backend.hostRoute;

    this.remoteHostProtocol = config.backend.ssl ? 'https' : 'http';

    this.remoteEndpoint =
      `${this.remoteHostProtocol}://${this.remoteHost}:${this.remoteHostPort}${this.remoteHostPath}`;

    this.healthEndpoint =
      `${this.remoteHostProtocol}://${this.remoteHost}:${this.remoteHostHealthPort}${this.remoteHostPath}`;

    this.mockData = config.dev.mockData;
  }
}

export default Configuration;