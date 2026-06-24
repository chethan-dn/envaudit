export class AppService {
  constructor(
    private readonly configService: {
      get: (key: string, defaultValue?: string) => string | undefined;
    },
  ) {}

  getThrottleTtl(): string | undefined {
    return this.configService.get('THROTTLE_TTL', '60');
  }

  getServiceUrl(): string | undefined {
    return this.configService.get('SERVICE_URL');
  }

  getDatabaseUrl(): string | undefined {
    return this.configService.get('DATABASE_URL');
  }
}
