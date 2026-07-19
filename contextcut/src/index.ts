#!/usr/bin/env node
import { Command, Option } from 'commander';
import { promises as fs } from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { crawlRepository, pruneCode } from './parser.js';
import { loadConfig, type ContextCutConfig } from './config.js';
import { fetchRemoteConfig } from './api.js';

const program = new Command();

program
  .name('contextcut')
  .description('A token-optimization CLI for AI coding agents')
  .version('0.1.0')
  .option('-d, --dir <path>', 'Target directory to parse', process.cwd())
  .option('-o, --out <filename>', 'Output manifest file', 'context.md')
  .addOption(
    new Option('-m, --mode <mode>', 'Optimization mode (overrides .contextcutrc)').choices([
      'skeleton',
      'full-text',
    ])
  )
  .option('-p, --prune-bodies', 'Alias for --mode skeleton')
  .option('-k, --key <token>', 'Premium team license key for remote sync (or CONTEXTCUT_LICENSE env var)')
  .action(async (options) => {
    const targetDir = path.resolve(options.dir);
    const outFile = path.resolve(process.cwd(), options.out);

    console.log(chalk.gray(`\n[ContextCut] Initializing crawler in: ${targetDir}`));

    try {
      // 1. Load baseline local config
      const fileConfig = await loadConfig(targetDir);

      // 2. Intercept and override if a key is provided.
      // Remote state overwrites local state (precedence: CLI flag > remote > .contextcutrc > default).
      const licenseKey = options.key ?? process.env.CONTEXTCUT_LICENSE;
      let remoteConfig: Partial<ContextCutConfig> = {};
      if (licenseKey) {
        console.log(chalk.gray(`[ContextCut] Authenticating license against Edge API...`));
        try {
          const remote = await fetchRemoteConfig(licenseKey);
          remoteConfig = remote.config;
          console.log(chalk.greenBright(`✔ Team configuration synchronized.`));
          console.log(chalk.gray(`[ContextCut] Team: `) + chalk.cyanBright(remote.team.name ?? remote.team.id));
        } catch (networkError) {
          // Hard fail on any sync failure to prevent accidental leaks using local rules
          console.error(chalk.redBright(`[Auth Error] ${(networkError as Error).message}`));
          process.exit(1);
        }
      }

      const config: ContextCutConfig = {
        ...fileConfig,
        ...remoteConfig,
        mode:
          options.mode ??
          (options.pruneBodies ? 'skeleton' : undefined) ??
          remoteConfig.mode ??
          fileConfig.mode,
      };

      console.log(chalk.gray(`[ContextCut] Mode: `) + chalk.cyanBright(config.mode));
      if (config.ignoreDirs && config.ignoreDirs.length > 0) {
        console.log(chalk.gray(`[ContextCut] Ignores: ${config.ignoreDirs.join(', ')}`));
      }

      const files = await crawlRepository(targetDir, config);
      console.log(chalk.blueBright(`\n[ContextCut] Mapped ${files.length} valid source files.\n`));

      let totalOriginalLength = 0;
      let totalPrunedLength = 0;
      let fallbackCount = 0;
      let skippedCount = 0;
      let manifestContent = `# ContextCut Optimization Manifest\n\n`;

      for (const file of files) {
        // One unreadable file must not sink the whole run
        let rawCode: string;
        try {
          rawCode = await fs.readFile(file, 'utf-8');
        } catch {
          skippedCount++;
          continue;
        }
        totalOriginalLength += rawCode.length;

        const { code: optimizedCode, usedFallback } = pruneCode(rawCode, file, config);
        if (usedFallback) {
          fallbackCount++;
          console.warn(chalk.yellow(`[ContextCut] Parse errors in ${file} — kept raw source.`));
        }
        totalPrunedLength += optimizedCode.length;

        // Append to the Markdown manifest; widen the fence if the code contains one
        const relativePath = path.relative(targetDir, file);
        const fence = optimizedCode.includes('```') ? '````' : '```';
        manifestContent += `## File: ${relativePath}\n${fence}typescript\n${optimizedCode}\n${fence}\n\n`;
      }

      await fs.writeFile(outFile, manifestContent, 'utf-8');

      // Token estimation heuristics
      const originalTokens = Math.floor(totalOriginalLength / 4);
      const prunedTokens = Math.floor(totalPrunedLength / 4);
      const savings =
        originalTokens > 0
          ? (((originalTokens - prunedTokens) / originalTokens) * 100).toFixed(2)
          : '0.00';

      console.log(chalk.green('✔ Optimization Complete'));
      console.log(chalk.gray('----------------------------------------'));
      console.log(`Original Size:   ~${originalTokens.toLocaleString()} tokens`);
      console.log(`Optimized Size:  ~${prunedTokens.toLocaleString()} tokens`);
      console.log(chalk.yellowBright(`Reduction:       ⬇ ${savings}%`));
      if (fallbackCount > 0) console.log(`Unparseable:     ${fallbackCount} file(s) kept raw`);
      if (skippedCount > 0) console.log(`Unreadable:      ${skippedCount} file(s) skipped`);
      console.log(chalk.gray('----------------------------------------'));
      console.log(`Manifest written to: ${outFile}\n`);
    } catch (error) {
      console.error(chalk.redBright(`\n[Fatal Error] ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

program.parse(process.argv);
