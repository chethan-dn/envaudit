import type { AppConfigService } from './app-config.service.js';

export class ConsumerService {
  constructor(private readonly appConfig: AppConfigService) {}

  getDatabaseUrl(): string {
    return this.appConfig.databaseUrl;
  }

  getOpenAiKey(): string {
    return this.appConfig.openAiKey;
  }
}
