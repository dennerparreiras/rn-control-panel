/**
 * Web Module
 *
 * This module handles Web-specific operations for the control panel.
 */

import chalk from 'chalk';
import type { WebHandler } from './types';
import { ControlPanelConfig } from '../types';
import { Utils } from '../Utils';

/**
 * Web Handler Implementation
 *
 * Implementation of Web platform operations
 */
class WebHandlerImpl implements WebHandler {
  private config: ControlPanelConfig;
  private utils: Utils;

  /**
   * Constructor
   *
   * @param config - Control panel configuration
   * @param utils - Utilities instance
   */
  constructor(config: ControlPanelConfig, utils: Utils) {
    this.config = config;
    this.utils = utils;
  }

  /**
   * Set up Web environment
   *
   * @param environment - The target environment (development, staging, production)
   * @returns Promise resolving to setup success status
   */
  public async setupEnvironment(environment: string): Promise<boolean> {
    console.log(chalk.cyan(`\n⚙️ Setting up Web environment for ${environment}...`));
    
    // For web, we typically just need to ensure the environment file is in place
    // which should already be handled by the environment module
    return true;
  }

  /**
   * Execute debug command (development server)
   *
   * @param environment - The target environment
   * @returns Promise resolving to execution success status
   */
  public async executeDebug(environment: string): Promise<boolean> {
    try {
      // Check if a custom script is defined in the config
      const runScript = this.config.web.scripts['run-script'];
      
      if (runScript) {
        await this.utils.executeCommand(
          `${runScript} --env ${environment}`,
          `Starting Web development server for ${environment}`,
          { maxBuffer: 50 * 1024 * 1024 }
        );
      } else {
        // Default to running the standard web development server
        await this.utils.executeCommand(
          `npm run start:web -- --mode ${environment}`,
          `Starting Web development server for ${environment}`,
          { maxBuffer: 50 * 1024 * 1024 }
        );
      }
      
      return true;
    } catch (error) {
      console.error(chalk.red(`Error starting Web development server: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Execute build command
   *
   * @param environment - The target environment
   * @returns Promise resolving to execution success status
   */
  public async executeBuild(environment: string): Promise<boolean> {
    try {
      // Check if a custom script is defined in the config
      const buildScript = this.config.web.scripts['build-script'];
      
      if (buildScript) {
        await this.utils.executeCommand(
          buildScript,
          `Building Web app for ${environment}`,
          { maxBuffer: 50 * 1024 * 1024 }
        );
      } else {
        // Default to running the standard web build
        const buildCommand = `npm run build:web -- --mode ${environment}`;
        
        await this.utils.executeCommand(
          buildCommand,
          `Building Web app for ${environment}`,
          { maxBuffer: 50 * 1024 * 1024 }
        );
      }
      
      console.log(chalk.green('\n✓ Web build completed successfully!'));
      return true;
    } catch (error) {
      console.error(chalk.red(`Error building Web app: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Execute deploy command
   *
   * @param environment - The target environment
   * @returns Promise resolving to execution success status
   */
  public async executeDeploy(environment: string): Promise<boolean> {
    try {
      // Check if a custom script is defined in the config
      const deployScript = this.config.web.scripts['deploy-script'];
      
      if (deployScript) {
        await this.utils.executeCommand(
          deployScript,
          `Deploying Web app to ${environment}`,
          { maxBuffer: 50 * 1024 * 1024 }
        );
      } else {
        console.log(chalk.yellow('\n⚠ No deployment script defined in configuration.'));
        console.log(chalk.yellow('Please define a "deploy-script" in the web section of control-panel-data.json'));
        return false;
      }
      
      console.log(chalk.green('\n✓ Web deployment completed successfully!'));
      return true;
    } catch (error) {
      console.error(chalk.red(`Error deploying Web app: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Run diagnostics when errors occur
   *
   * @returns Promise resolving to diagnostic results
   */
  public async runDiagnostics(): Promise<string> {
    console.log(chalk.cyan('\n🔍 Running Web project diagnostics...'));
    
    try {
      // Check for common issues
      await this.utils.executeCommand(
        'npm list --depth=0',
        'Checking installed packages',
        { stdio: 'pipe' }
      );
      
      console.log(chalk.cyan('\n💡 Suggestions:'));
      console.log(
        chalk.cyan('1. Try running "npm install" to update dependencies')
      );
      console.log(
        chalk.cyan('2. Check the webpack configuration for errors')
      );
      console.log(
        chalk.cyan('3. Verify that all environment variables are properly set')
      );
      
      return 'Completed Web diagnostics';
    } catch (error) {
      console.error(chalk.red(`Error during diagnostics: ${(error as Error).message}`));
      return 'Failed to run Web diagnostics';
    }
  }
}

/**
 * Create and export the Web handler implementation
 * 
 * @param config - Control panel configuration
 * @param utils - Utilities instance
 * @returns An implementation of the WebHandler interface
 */
export function createWebHandler(config: ControlPanelConfig, utils: Utils): WebHandler {
  return new WebHandlerImpl(config, utils);
}

// Exportar os tipos também
export * from './types';
