export class AppConfigService {
  get databaseUrl(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get openAiKey(): string {
    return this.configService.get<string>('OPENAI_API_KEY');
  }

  private readonly configService = {
    getOrThrow: <T>(_key: string): T => undefined as T,
    get: <T>(_key: string): T => undefined as T,
  };
}
