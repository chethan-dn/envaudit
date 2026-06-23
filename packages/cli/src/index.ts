#!/usr/bin/env node

import { Command } from 'commander';
import { registerCompareCommand } from './commands/compare.js';
import { registerExplainCommand } from './commands/explain.js';
import { registerGenerateCommand } from './commands/generate.js';
import { registerScanCommand } from './commands/scan.js';

const program = new Command();

program.name('envdoctor').description('Environment Intelligence CLI').version('0.0.0');

registerScanCommand(program);
registerCompareCommand(program);
registerExplainCommand(program);
registerGenerateCommand(program);

program.parse();
