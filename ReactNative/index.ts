/**
 * ReactNative Module
 *
 * This module handles React Native server operations for the control panel.
 */

import chalk from 'chalk';
import { exec } from 'child_process';
import type { ReactNativeHandler, ServerOptions } from './types';
import { ControlPanelConfig } from '../types';
import { Utils } from '../Utils';

/**
 * ReactNative Handler Implementation
 *
 * Implementation of React Native operations
 */
class ReactNativeHandlerImpl implements ReactNativeHandler {
  private config: ControlPanelConfig;
  private utils: Utils;
  private serverProcess: any = null;

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
   * Start the React Native server
   *
   * @param options - Server start options
   * @returns Promise resolving to start success status
   */
  public async startServer(options: ServerOptions): Promise<boolean> {
    // Check if server is already running
    const isRunning = await this.isServerRunning();
    if (isRunning) {
      console.log(chalk.yellow('\n⚠ React Native server is already running'));
      const shouldRestart = await this.utils.confirm('Would you like to restart it?');
      if (shouldRestart) {
        await this.stopServer();
      } else {
        return true;
      }
    }

    try {
      let command = 'npx react-native start';
      let description = 'Starting React Native server';
      
      if (options === 'fresh') {
        command += ' --reset-cache';
        description = 'Starting React Native server with cache reset';
      }

      console.log(chalk.cyan(`\n🚀 ${description}...`));
      console.log(chalk.gray(command));

      // Start server in detached mode
      this.utils.executeCommandAndDetach(command, description);
      
      console.log(chalk.green('\n✓ React Native server started successfully'));
      console.log(chalk.yellow('Press Ctrl+C to exit this terminal and let the server run in the background'));
      console.log(chalk.yellow('When you want to stop the server, run the control panel and select the stop server option'));
      
      return true;
    } catch (error) {
      console.error(chalk.red(`Error starting React Native server: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Stop the React Native server
   *
   * @returns Promise resolving to stop success status
   */
  public async stopServer(): Promise<boolean> {
    console.log(chalk.cyan('\n🛑 Stopping React Native server...'));
    
    // Find Metro server processes
    const command = process.platform === 'win32' 
      ? 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV' 
      : 'ps -ef | grep "react-native start\\|metro" | grep -v grep';
    
    return new Promise((resolve) => {
      exec(command, async (error, stdout) => {
        if (error) {
          console.error(chalk.red(`Error finding React Native server: ${error.message}`));
          resolve(false);
          return;
        }
        
        // Check if server is running
        const isRunning = process.platform === 'win32'
          ? stdout.toLowerCase().includes('node.exe')
          : stdout.trim() !== '';
          
        if (!isRunning) {
          console.log(chalk.yellow('No React Native server found to stop'));
          resolve(true);
          return;
        }
        
        // Kill Metro server process
        const killCommand = process.platform === 'win32'
          ? 'taskkill /F /IM node.exe /T' 
          : 'pkill -f "react-native start\\|metro"';
          
        exec(killCommand, (killError) => {
          if (killError) {
            console.error(chalk.red(`Error stopping React Native server: ${killError.message}`));
            resolve(false);
          } else {
            console.log(chalk.green('React Native server stopped successfully'));
            resolve(true);
          }
        });
      });
    });
  }

  /**
   * Check if the React Native server is running
   *
   * @returns Promise resolving to running status
   */
  public async isServerRunning(): Promise<boolean> {
    const command = process.platform === 'win32' 
      ? 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV' 
      : 'ps -ef | grep "react-native start\\|metro" | grep -v grep';
    
    return new Promise((resolve) => {
      exec(command, (error, stdout) => {
        if (error) {
          resolve(false);
          return;
        }
        
        const isRunning = process.platform === 'win32'
          ? stdout.toLowerCase().includes('node.exe')
          : stdout.trim() !== '';
          
        resolve(isRunning);
      });
    });
  }

  /**
   * Clean the React Native cache
   *
   * @returns Promise resolving to clean success status
   */
  public async cleanCache(): Promise<boolean> {
    try {
      console.log(chalk.cyan('\n🧹 Cleaning React Native cache...'));
      
      // Stop server if running
      const isRunning = await this.isServerRunning();
      if (isRunning) {
        console.log(chalk.yellow('Stopping React Native server before cleaning cache...'));
        await this.stopServer();
      }
      
      // Clean npm cache
      await this.utils.executeCommand(
        'npm cache clean --force',
        'Cleaning npm cache'
      );
      
      // Clean watchman if available
      if (process.platform !== 'win32') {
        try {
          await this.utils.executeCommand(
            'watchman watch-del-all',
            'Cleaning watchman cache'
          );
        } catch (error) {
          console.log(chalk.yellow('Watchman not installed or error cleaning watchman cache'));
        }
      }
      
      // Clean temp directories
      await this.utils.executeCommand(
        'rm -rf $TMPDIR/react-*',
        'Cleaning temp directories',
        { shell: true }
      );
      
      // Clean React Native cache
      await this.utils.executeCommand(
        'npx react-native start --reset-cache --no-interactive',
        'Resetting React Native cache'
      );
      
      console.log(chalk.green('\n✓ React Native cache cleaned successfully'));
      return true;
    } catch (error) {
      console.error(chalk.red(`Error cleaning React Native cache: ${(error as Error).message}`));
      return false;
    }
  }
}

/**
 * Create and export the ReactNative handler implementation
 * 
 * @param config - Control panel configuration
 * @param utils - Utilities instance
 * @returns An implementation of the ReactNativeHandler interface
 */
export function createReactNativeHandler(config: ControlPanelConfig, utils: Utils): ReactNativeHandler {
  return new ReactNativeHandlerImpl(config, utils);
}

// Exportar os tipos também
export * from './types'; 