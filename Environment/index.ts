/**
 * Environment Module
 *
 * This module handles environment management for the control panel.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { EnvironmentManager as IEnvironmentManager, EnvironmentTemplates, EnvironmentInfo } from './types';
import { ControlPanelConfig } from '../types';
import { Utils } from '../Utils';

/**
 * EnvironmentManagerImpl
 *
 * Implementation of environment management operations
 */
class EnvironmentManagerImpl implements IEnvironmentManager {
  private config: ControlPanelConfig;
  private utils: Utils;
  private envSourcePath: string;
  private envTargetPath: string;

  /**
   * Constructor
   *
   * @param config - Control panel configuration
   * @param utils - Utilities instance
   */
  constructor(config: ControlPanelConfig, utils: Utils) {
    this.config = config;
    this.utils = utils;
    this.envSourcePath = path.resolve(process.cwd(), 'environment');
    this.envTargetPath = path.resolve(process.cwd(), '.env');
  }

  /**
   * Check if an environment file exists
   *
   * @param environment - The environment name (development, staging, production)
   * @returns Boolean indicating if the environment file exists
   */
  public checkEnvironmentFile(environment: string): boolean {
    const envFilePath = path.join(this.envSourcePath, `.env.${environment}`);
    return fs.existsSync(envFilePath);
  }

  /**
   * Generate .env file from template
   *
   * @param environment - The environment name (development, staging, production)
   * @returns Promise resolving to generation success status
   */
  public async generateEnvFile(environment: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if the environment file exists
      const envFilePath = path.join(this.envSourcePath, `.env.${environment}`);
      
      if (!fs.existsSync(envFilePath)) {
        console.log('\n');
        console.log(
          chalk.red(
            `Environment file for ${chalk.bold(environment)} not found!`
          )
        );
        console.log(
          chalk.red(
            `The file ${chalk.bold(envFilePath)} is required to configure this environment.`
          )
        );
        console.log(
          chalk.yellow(
            `Verify that the file exists in the ${chalk.bold('environment/')} folder`
          )
        );
        console.log('\n');
        console.log(chalk.cyan('Instructions to resolve:'));
        console.log(
          chalk.cyan(
            `1. Create the file ${chalk.bold(`.env.${environment}`)} in the ${chalk.bold('environment/')} folder`
          )
        );
        console.log(
          chalk.cyan(
            `2. Check the documentation in ${chalk.bold('docs/ENVIRONMENT_SETUP.md')} for more details`
          )
        );
        console.log('\n');
        resolve(false);
        return;
      }

      const spinner = this.utils.showSpinner(
        `Generating environment file for ${chalk.bold(environment)}...`
      );

      // Define source environment file path
      const sourceEnvFile = envFilePath;

      // Read the environment file
      fs.readFile(sourceEnvFile, 'utf8', (readErr, envContent) => {
        if (readErr) {
          spinner.stop(
            chalk.red(
              `Error reading environment file for ${environment}: ${readErr}`
            )
          );
          resolve(false);
          return;
        }

        // Write to .env file in project root
        fs.writeFile(this.envTargetPath, envContent, (writeErr) => {
          if (writeErr) {
            spinner.stop(chalk.red(`Error creating .env file: ${writeErr}`));
            resolve(false);
          } else {
            spinner.stop(
              chalk.green(
                `Successfully created .env file for ${chalk.bold(environment)} environment`
              )
            );
            resolve(true);
          }
        });
      });
    });
  }

  /**
   * Get available environment templates
   *
   * @returns Object with status of each environment template
   */
  public checkEnvironmentTemplates(): EnvironmentTemplates {
    try {
      const results: EnvironmentTemplates = {
        development: fs.existsSync(
          path.join(this.envSourcePath, '.env.development')
        ),
        staging: fs.existsSync(
          path.join(this.envSourcePath, '.env.staging')
        ),
        production: fs.existsSync(
          path.join(this.envSourcePath, '.env.production')
        ),
      };

      return results;
    } catch (error) {
      console.error(
        chalk.red(
          `Failed to check environment templates: ${(error as Error).message}`
        )
      );
      return { development: false, staging: false, production: false };
    }
  }

  /**
   * Get current environment from .env file
   *
   * @returns Object with environment status and type
   */
  public getCurrentEnvironment(): EnvironmentInfo {
    return this.utils.checkEnvFile();
  }

  /**
   * Set up environment for a specific platform
   *
   * @param environment - The environment name
   * @param platform - The platform code (i, a, w)
   * @returns Promise resolving to setup success status
   */
  public async setupPlatformEnvironment(environment: string, platform: string): Promise<boolean> {
    switch (platform) {
      case 'i':
        return await this.setupIOSEnvironment(environment);
      case 'a':
        return await this.setupAndroidEnvironment(environment);
      case 'w':
        // Web doesn't need special setup beyond the .env file
        return true;
      default:
        console.error(chalk.red(`Unknown platform: ${platform}`));
        return false;
    }
  }

  /**
   * Set up iOS environment
   * 
   * @param environment - The environment name
   * @returns Promise resolving to setup success status
   */
  private async setupIOSEnvironment(environment: string): Promise<boolean> {
    const setupEnvCommand = `cd ios && PROJECT_DIR=$(pwd) ./scripts/setup-env.sh ${environment}`;
    console.log(chalk.cyan('\n⚙️ Setting up iOS environment...'));

    try {
      await this.utils.executeCommand(
        setupEnvCommand,
        'Setting up iOS environment'
      );
      return true;
    } catch (error) {
      console.error(chalk.red(`Error during iOS setup: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Set up Android environment
   * 
   * @param environment - The environment name
   * @returns Promise resolving to setup success status
   */
  private async setupAndroidEnvironment(environment: string): Promise<boolean> {
    // Check if the setup-env.sh script exists and create it if necessary
    const setupScriptPath = path.resolve(
      process.cwd(),
      'android',
      'scripts',
      'setup-env.sh'
    );
    const setupScriptDir = path.dirname(setupScriptPath);

    if (!fs.existsSync(setupScriptDir)) {
      console.log(chalk.gray('📁 Creating directory for Android scripts...'));
      fs.mkdirSync(setupScriptDir, { recursive: true });
    }

    if (!fs.existsSync(setupScriptPath)) {
      console.log(chalk.yellow('⚠️ Android setup script not found. Creating...'));

      // Basic content for the setup script
      const setupScriptContent = `#!/bin/bash

# Script to configure the Android environment
# Copies the appropriate environment file and configures the necessary variables

# Get the environment from the argument
ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: ./setup-env.sh [environment]"
    echo "Example: ./setup-env.sh production"
    echo "Example: ./setup-env.sh staging"
    exit 1
fi

# Path to the project root directory (2 levels above this script)
PROJECT_ROOT=$(cd "$(dirname "$0")/../.." && pwd)

# Source and destination paths
ENV_SOURCE="\${PROJECT_ROOT}/environment/.env.\${ENVIRONMENT}"
ENV_DEST="\${PROJECT_ROOT}/.env"

# Check if the source file exists
if [ ! -f "$ENV_SOURCE" ]; then
    echo "Error: Environment file not found: $ENV_SOURCE"
    exit 1
fi

# Copy the environment file
echo "Configuring environment for: $ENVIRONMENT"
cp "$ENV_SOURCE" "$ENV_DEST"

if [ $? -eq 0 ]; then
    echo "✅ Environment successfully configured for $ENVIRONMENT"
else
    echo "❌ Failed to copy environment file"
    exit 1
fi

# Define the ENVIRONMENT environment variable for Gradle commands
export ENVIRONMENT=$ENVIRONMENT

echo "✅ Android environment setup completed!"
exit 0`;

      fs.writeFileSync(setupScriptPath, setupScriptContent);
      fs.chmodSync(setupScriptPath, '755'); // Make executable
      console.log(chalk.green('✅ Setup script created successfully!'));
    }

    const setupCommand = `cd android && ./scripts/setup-env.sh ${environment}`;

    console.log(chalk.cyan('⚙️ Configuring Android environment...'));
    const setupSpinner = this.utils.showSpinner('Executing setup command...');

    try {
      await this.utils.executeCommand(setupCommand, 'Android environment setup');
      setupSpinner.stop(chalk.green('✓ Android environment setup completed!'));
      return true;
    } catch (error) {
      setupSpinner.stop(chalk.red('✘ Android environment setup failed!'));
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      return false;
    }
  }
}

/**
 * Create and export the Environment manager implementation
 * 
 * @param config - Control panel configuration
 * @param utils - Utilities instance
 * @returns An implementation of the EnvironmentManager interface
 */
export function createEnvironmentManager(config: ControlPanelConfig, utils: Utils): IEnvironmentManager {
  return new EnvironmentManagerImpl(config, utils);
}

// For backward compatibility
export const EnvironmentManager = createEnvironmentManager;

// Exportar os tipos também
export * from './types'; 