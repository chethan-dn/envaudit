export class AppService {
  constructor(private readonly configService: { get: (key: string) => string | undefined }) {}

  getDatabaseUrl(): string | undefined {
    return this.configService.get('DATABASE_URL');
  }
}
