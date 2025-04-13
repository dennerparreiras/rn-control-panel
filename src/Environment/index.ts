/**
 * Environment Module
 *
 * This module handles environment file management and switching between environments.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { ControlPanelConfig } from '../types';
import { Utilities } from '../Utils/types';

/**
 * Environment Manager
 *
 * Manages environment file operations
 */
export class EnvironmentManager {
  private config: ControlPanelConfig;
  private utils: Utilities;
  private envSourcePath: string;
  private envTargetPath: string;

  /**
   * Constructor
   *
   * @param config Control panel configuration
   * @param utils Utility functions
   */
  constructor(config: ControlPanelConfig, utils: Utilities) {
    this.config = config;
    this.utils = utils;
    this.envSourcePath = path.resolve(process.cwd(), 'environment');
    this.envTargetPath = path.resolve(process.cwd(), '.env');
  }

  /**
   * Check Environment File
   * 
   * Verifies if the environment file exists
   * 
   * @param environment Environment name
   * @returns Whether the environment file exists
   */
  checkEnvironmentFile(environment: string): boolean {
    const envFilePath = path.join(
      this.envSourcePath,
      `.env.${environment}`,
    );
    return fs.existsSync(envFilePath);
  }

  /**
   * Generate Env File
   * 
   * Generates a .env file from a template for the specified environment
   * 
   * @param environment Environment name to generate
   * @returns Promise resolving to success status
   */
  async generateEnvFile(environment: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Verify environment file exists
      const envFilePath = path.join(
        this.envSourcePath,
        `.env.${environment}`,
      );
      if (!fs.existsSync(envFilePath)) {
        console.log('\n');
        console.log(
          chalk.red(
            `Environment file for ${chalk.bold(environment)} not found!`,
          ),
        );
        console.log(
          chalk.red(
            `The file ${chalk.bold(envFilePath)} is required to configure this environment.`,
          ),
        );
        console.log(
          chalk.yellow(
            `Verify that the file exists in the ${chalk.bold('environment/')} folder`,
          ),
        );
        console.log('\n');
        console.log(chalk.cyan('Instructions to resolve:'));
        console.log(
          chalk.cyan(
            `1. Create the file ${chalk.bold(`.env.${environment}`)} in the ${chalk.bold('environment/')} folder`,
          ),
        );
        console.log(
          chalk.cyan(
            `2. See documentation in ${chalk.bold('docs/ENVIRONMENT_SETUP.md')} for more details`,
          ),
        );
        console.log('\n');
        resolve(false);
        return;
      }

      const spinner = this.utils.showSpinner(
        `Generating environment file for ${chalk.bold(environment)}...`,
      );

      // Define source environment file path
      const sourceEnvFile = envFilePath;

      // Read the environment file
      fs.readFile(sourceEnvFile, 'utf8', (readErr, envContent) => {
        if (readErr) {
          spinner.stop(
            chalk.red(
              `Error reading environment file for ${environment}: ${readErr}`,
            ),
          );
          resolve(false);
          return;
        }

        // Write to .env file in project root
        fs.writeFile(this.envTargetPath, envContent, (writeErr) => {
          if (writeErr) {
            spinner.stop(
              chalk.red(`Error creating .env file: ${writeErr}`),
            );
            resolve(false);
          } else {
            spinner.stop(
              chalk.green(
                `Successfully created .env file for ${chalk.bold(environment)} environment`,
              ),
            );
            resolve(true);
          }
        });
      });
    });
  }
}

/**
 * Create Environment Manager
 *
 * Factory function to create an environment manager instance
 *
 * @param config Control panel configuration
 * @param utils Utility functions
 * @returns Environment manager instance
 */
export function createEnvironmentManager(
  config: ControlPanelConfig,
  utils: Utilities
): EnvironmentManager {
  return new EnvironmentManager(config, utils);
} 