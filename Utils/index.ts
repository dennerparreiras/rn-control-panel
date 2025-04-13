/**
 * Utils Module
 *
 * This module provides utility functions used across the control panel.
 */

import { exec, spawn, ExecOptions } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Utilities, VerbosityControl, ExecuteCommandOptions, Spinner, ConfirmOptions } from './types';
import { ControlPanelConfig, CommandLineArgs, DeviceInfo, EnvironmentStatus } from '../types';

/**
 * Utils
 *
 * Implementation of utility methods used across the control panel
 */
export class Utils implements Utilities {
  private config: ControlPanelConfig;
  public verbosity: VerbosityControlImpl;

  /**
   * Constructor
   *
   * @param config - Control panel configuration
   */
  constructor(config: ControlPanelConfig) {
    this.config = config;
    this.verbosity = new VerbosityControlImpl();
  }

  /**
   * Promise-based readline question
   *
   * @param query - Question to ask
   * @returns Promise resolving to user's answer
   */
  public question(query: string): Promise<string> {
    return new Promise((resolve) => {
      const rl = (global as any).rl;
      if (rl) {
        rl.question(query, (answer: string) => resolve(answer));
      } else {
        console.error(chalk.red('Error: Readline interface not initialized'));
        resolve('');
      }
    });
  }

  /**
   * Ask for confirmation (y/n)
   *
   * @param query - Question to ask
   * @param options - Confirmation options
   * @returns Promise resolving to user's confirmation
   */
  public async confirm(query: string, options?: ConfirmOptions): Promise<boolean> {
    const defaultValue = options?.defaultValue ?? false;
    const yesText = options?.yesText ?? 'y';
    const noText = options?.noText ?? 'N';
    
    const promptText = defaultValue ? `${yesText}/${noText}` : `${yesText}/${noText}`;
    const answer = await this.question(chalk.yellow(`${query} (${promptText}): `));
    
    if (!answer.trim()) {
      return defaultValue;
    }
    
    return answer.toLowerCase() === yesText.toLowerCase();
  }

  /**
   * Display a spinner animation during async operations
   *
   * @param text - Text to display with spinner
   * @returns Spinner control object
   */
  public showSpinner(text: string): Spinner {
    const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const spinnerInterval = setInterval(() => {
      process.stdout.write(`\r${chalk.cyan(spinnerFrames[i])} ${text}`);
      i = (i + 1) % spinnerFrames.length;
    }, 80);

    return {
      update: (newText: string) => {
        text = newText;
      },
      stop: (finalText = '') => {
        clearInterval(spinnerInterval);
        process.stdout.write(`\r${finalText}\n`);
      },
    };
  }

  /**
   * Parse command line arguments
   *
   * @returns Parsed command line arguments
   */
  public parseCommandLineArgs(): CommandLineArgs {
    const args = process.argv.slice(2);
    const result: CommandLineArgs = {
      environment: null,
      platform: null,
      action: null,
      operation: null,
      verbose: args.includes('--verbose'),
    };

    // Main operation options
    if (args.includes('--version')) {
      result.operation = 'version';
    } else if (args.includes('--env')) {
      result.operation = 'env';
    } else if (args.includes('--dev')) {
      result.operation = 'dev';
    } else if (args.includes('--start-server')) {
      result.operation = 'start-server';
    } else if (args.includes('--env-dev')) {
      result.operation = 'env-dev';
    } else if (args.includes('--version-env-dev')) {
      result.operation = 'version-env-dev';
    }

    // Server options
    if (args.includes('--fresh')) {
      result.serverOption = 'fresh';
    } else {
      result.serverOption = 'standard';
    }

    // Environment options
    if (args.includes('--development') || args.includes('--dev')) {
      result.environment = 'd';
    } else if (args.includes('--staging') || args.includes('--stag')) {
      result.environment = 's';
    } else if (args.includes('--production') || args.includes('--prod')) {
      result.environment = 'p';
    }

    // Platform options
    if (args.includes('--ios')) {
      result.platform = 'i';
    } else if (args.includes('--android')) {
      result.platform = 'a';
    } else if (args.includes('--web')) {
      result.platform = 'w';
    }

    // Action options
    if (args.includes('--debug')) {
      result.action = 'd';
    } else if (args.includes('--release')) {
      result.action = 'r';
    } else if (args.includes('--build')) {
      result.action = 'b';
    } else if (args.includes('--deploy')) {
      result.action = 'p';
    } else if (args.includes('--exit')) {
      result.action = 'e';
    }

    return result;
  }

  /**
   * Handle special commands in user input
   *
   * @param input - User input
   * @param currentStep - Current step name
   * @returns Promise resolving to whether input was handled
   */
  public async handleSpecialCommands(input: string, currentStep: string): Promise<boolean> {
    const normalizedInput = input.toLowerCase().trim();

    // Handle exit/quit command
    if (normalizedInput === 'exit' || normalizedInput === 'quit') {
      const shouldExit = await this.confirm('Are you sure you want to exit?');
      if (shouldExit) {
        console.log(chalk.gray('Exiting application...'));
        const rl = (global as any).rl;
        if (rl) {
          rl.close();
        }
        process.exit(0);
      }
      return true; // Indicates input was handled
    }

    // Handle skip command
    if (normalizedInput === 'skip') {
      console.log(chalk.yellow(`⏩ Skipping ${currentStep} selection...`));
      return true; // Indicates input was handled
    }

    return false; // Input was not a special command
  }

  /**
   * Execute a shell command with a spinner
   *
   * @param command - Command to execute
   * @param description - Description of command for spinner
   * @param options - Child process execution options
   * @returns Promise resolving to command output
   */
  public executeCommand(
    command: string,
    description: string,
    options?: ExecuteCommandOptions
  ): Promise<string> {
    return this.verbosity.executeCommand(command, description, options);
  }

  /**
   * Execute a command and detach from it (for long-running processes)
   * 
   * @param command - Command to execute
   * @param description - Description of command
   */
  public executeCommandAndDetach(command: string, description: string): void {
    console.log(chalk.cyan(`\n🚀 ${description}...`));
    console.log(chalk.gray(command));

    // Split the command into parts
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    // Use spawn to run the command
    const child = spawn(cmd, args, {
      detached: true,
      stdio: 'inherit'
    });

    // Unref the child process so parent can exit independently
    child.unref();
  }

  /**
   * Filter simulators to keep only the highest OS version for each model
   *
   * @param simulators - Array of simulator devices
   * @returns Filtered simulators
   */
  public filterSimulatorsByHighestOSVersion(simulators: DeviceInfo[]): DeviceInfo[] {
    // Create a map to group simulators by model name
    const modelGroups: { [key: string]: DeviceInfo[] } = {};

    // Process each simulator to extract model name and OS version
    simulators.forEach((simulator) => {
      // Extract OS version from the simulator information
      let osVersion = '0';

      // Try to get from the osVersion property if it was added during parsing
      if (simulator.osVersion) {
        osVersion = simulator.osVersion;
      } else {
        // Extract from id if it contains OS info (for the format: OS:18.4)
        const osMatch = simulator.id.match(/OS:([0-9.]+)/i);
        if (osMatch && osMatch[1]) {
          osVersion = osMatch[1];
        }

        // If not found in id, try to extract from the simulator name
        if (osVersion === '0') {
          const nameOsMatch = simulator.name.match(/\(([0-9.]+)\)/);
          if (nameOsMatch && nameOsMatch[1]) {
            osVersion = nameOsMatch[1];
          }
        }
      }

      // Extract base model name without OS version
      // Remove "Simulator" from the end if present
      let modelName = simulator.name.replace(/\s+Simulator$/i, '');

      // Remove OS version in parentheses if present
      modelName = modelName.replace(/\s*\([0-9.]+\)\s*$/, '');

      // Create entry for this model if it doesn't exist
      if (!modelGroups[modelName]) {
        modelGroups[modelName] = [];
      }

      // Add this simulator to its model group with OS version
      modelGroups[modelName].push({
        ...simulator,
        osVersion,
        modelName, // Add model name for debugging
      });
    });

    // For each model group, keep only the simulator with highest OS version
    const highestVersionSimulators: DeviceInfo[] = [];

    Object.keys(modelGroups).forEach((modelName) => {
      const simulatorsForModel = modelGroups[modelName];

      // Sort by OS version (descending)
      simulatorsForModel.sort((a, b) => {
        // Compare version numbers
        const aVersionParts = a.osVersion!.split('.').map(Number);
        const bVersionParts = b.osVersion!.split('.').map(Number);

        // Compare each part of the version number
        for (
          let i = 0;
          i < Math.max(aVersionParts.length, bVersionParts.length);
          i++
        ) {
          const aValue = i < aVersionParts.length ? aVersionParts[i] : 0;
          const bValue = i < bVersionParts.length ? bVersionParts[i] : 0;

          if (aValue !== bValue) {
            return bValue - aValue; // descending order
          }
        }

        return 0; // versions are equal
      });

      // Add the highest version to our result
      if (simulatorsForModel.length > 0) {
        highestVersionSimulators.push(simulatorsForModel[0]);
      }
    });

    return highestVersionSimulators;
  }

  /**
   * Load and parse package.json data
   *
   * @returns Package.json data
   */
  public getPackageInfo(): any {
    try {
      const packageJson = fs.readFileSync(
        path.resolve(process.cwd(), 'package.json'),
        'utf8',
      );
      return JSON.parse(packageJson);
    } catch (error) {
      console.error(chalk.red(`Failed to read package.json: ${(error as Error).message}`));
      return {
        name: 'unknown',
        version: 'unknown',
        company: 'unknown',
        metadataApp: { versionCode: 'unknown' },
      };
    }
  }

  /**
   * Check if an environment file exists and what environment it's for
   *
   * @returns Environment status
   */
  public checkEnvFile(): EnvironmentStatus {
    const envPath = path.resolve(process.cwd(), '.env');
    
    try {
      const envExists = fs.existsSync(envPath);
      let envType = null;

      if (envExists) {
        const envContent = fs.readFileSync(envPath, 'utf8');

        // Try to determine which environment it is based on content
        if (
          envContent.includes('ENV=development') ||
          envContent.includes('ENVIRONMENT=development')
        ) {
          envType = 'development';
        } else if (
          envContent.includes('ENV=staging') ||
          envContent.includes('ENVIRONMENT=staging')
        ) {
          envType = 'staging';
        } else if (
          envContent.includes('ENV=production') ||
          envContent.includes('ENVIRONMENT=production')
        ) {
          envType = 'production';
        }
      }

      return { exists: envExists, type: envType };
    } catch (error) {
      console.error(chalk.red(`Failed to check environment file: ${(error as Error).message}`));
      return { exists: false, type: null };
    }
  }

  /**
   * Read a file asynchronously
   *
   * @param filePath - Path to file
   * @param encoding - File encoding
   * @returns Promise resolving to file contents
   */
  public readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, { encoding }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data as string);
        }
      });
    });
  }

  /**
   * Write a file asynchronously
   *
   * @param filePath - Path to file
   * @param content - File content
   * @param encoding - File encoding
   * @returns Promise resolving to success status
   */
  public writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<boolean> {
    return new Promise((resolve) => {
      fs.writeFile(filePath, content, { encoding }, (err) => {
        if (err) {
          console.error(chalk.red(`Error writing file: ${err.message}`));
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}

/**
 * Verbosity Control Implementation
 *
 * Implementation of verbosity control for console output
 */
export class VerbosityControlImpl implements VerbosityControl {
  public isVerbose: boolean = false;

  /**
   * Initialize verbosity settings from command line args
   */
  public init(): void {
    const args = process.argv.slice(2);
    this.isVerbose = args.includes('--verbose');
  }

  /**
   * Log message only if verbose mode is enabled
   *
   * @param message - Message to log
   */
  public log(message: string): void {
    if (this.isVerbose) {
      console.log(message);
    }
  }

  /**
   * Log error message (always shown)
   *
   * @param message - Error message to log
   */
  public error(message: string): void {
    console.error(message);
  }

  /**
   * Run command with appropriate verbosity
   *
   * @param command - Command to execute
   * @param description - Description of command
   * @param options - Child process execution options
   * @returns Promise resolving to command output
   */
  public executeCommand(
    command: string,
    description: string,
    options: ExecuteCommandOptions = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const spinner = this.createSpinner(description);
      const isVerbose = this.isVerbose;

      // Set default maxBuffer to 10MB to handle large outputs
      const execOptions: ExecOptions = { 
        maxBuffer: 10 * 1024 * 1024, 
        ...options 
      };

      exec(command, execOptions, (error, stdout, stderr) => {
        if (error) {
          spinner.stop(chalk.red(`${description} failed!`));
          console.error(chalk.red(`Error: ${error.message}`));
          if (stderr && isVerbose) {
            console.error(chalk.red(stderr));
          } else if (stderr) {
            // Show condensed error if not verbose
            const lines = stderr.split('\n').slice(0, 3);
            if (lines.length > 0) {
              console.error(chalk.red(lines.join('\n')));
              console.error(chalk.yellow('Use --verbose to see full error output'));
            }
          }
          reject(error);
          return;
        }

        spinner.stop(chalk.green(`${description} completed!`));
        if (stdout.trim() && isVerbose) {
          console.log(chalk.gray('Output:'));
          console.log(chalk.gray(stdout));
        }
        resolve(stdout);
      });
    });
  }

  /**
   * Create a spinner
   * 
   * @param text - Text to display
   * @returns Spinner
   */
  private createSpinner(text: string): Spinner {
    const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const spinnerInterval = setInterval(() => {
      process.stdout.write(`\r${chalk.cyan(spinnerFrames[i])} ${text}`);
      i = (i + 1) % spinnerFrames.length;
    }, 80);

    return {
      update: (newText: string) => {
        text = newText;
      },
      stop: (finalText = '') => {
        clearInterval(spinnerInterval);
        process.stdout.write(`\r${finalText}\n`);
      },
    };
  }
}

// Exportações simplificadas
export * from './types'; 