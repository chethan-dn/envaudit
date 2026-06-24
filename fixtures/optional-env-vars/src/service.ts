export class AppService {
  constructor(private readonly configService: { get: (key: string, defaultValue?: unknown) => unknown }) {}

  getThrottleTtl(): unknown {
    return this.configService.get('THROTTLE_TTL', 60);
  }

  getDatabaseUrl(): unknown {
    return this.configService.get('DATABASE_URL');
  }
}
