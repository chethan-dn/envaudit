#!/usr/bin/env node

import { createRequire } from 'node:module';
import { Command } from 'commander';
import { registerCompareCommand } from './commands/compare.js';
import { registerExplainCommand } from './commands/explain.js';
import { registerGenerateCommand } from './commands/generate.js';
import { registerScanCommand } from './commands/scan.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

const program = new Command();

program.name('envaudit').description('Environment Intelligence CLI').version(version);

registerScanCommand(program);
registerCompareCommand(program);
registerExplainCommand(program);
registerGenerateCommand(program);

program.parse();
