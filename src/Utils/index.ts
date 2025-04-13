/**
 * Utils Module
 *
 * This module provides utilities used across the control panel.
 * It includes functions for console interaction, command execution, and verbosity control.
 */

import chalk from 'chalk';
import { exec } from 'child_process';
import { ControlPanelConfig, Spinner, DeviceInfo } from '../types';

/**
 * Verbosity Control Implementation
 *
 * Controls logging based on verbose mode
 */
export class VerbosityControlImpl {
  isVerbose: boolean = false;

  /**
   * Initialize verbosity settings
   */
  init(): void {
    const args = process.argv.slice(2);
    this.isVerbose = args.includes('--verbose');
  }

  /**
   * Log message only if verbose mode is enabled
   */
  log(message: string): void {
    if (this.isVerbose) {
      console.log(message);
    }
  }

  /**
   * Log error message (always shown regardless of verbose setting)
   */
  error(message: string): void {
    console.error(message);
  }

  /**
   * Run command with appropriate verbosity
   */
  executeCommand(
    command: string,
    description: string,
    options: Record<string, any> = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const spinner = this.showSpinner(description);
      const isVerbose = this.isVerbose;

      // Set default maxBuffer to 10MB to handle large outputs
      const execOptions = { maxBuffer: 10 * 1024 * 1024, ...options };

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
              console.error(
                chalk.yellow('Use --verbose to see full error output')
              );
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
   * Display a spinner animation during async operations
   */
  private showSpinner(text: string): Spinner {
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

/**
 * Utils Class
 *
 * Provides utility functions for the control panel
 */
export class Utils {
  private config: ControlPanelConfig;
  public verbosity: VerbosityControlImpl;

  /**
   * Constructor
   *
   * @param config Control panel configuration
   */
  constructor(config: ControlPanelConfig) {
    this.config = config;
    this.verbosity = new VerbosityControlImpl();
  }

  /**
   * Promise-based readline question
   */
  async question(query: string): Promise<string> {
    return new Promise((resolve) => (global as any).rl.question(query, resolve));
  }

  /**
   * Ask for confirmation (y/n)
   */
  async confirm(query: string): Promise<boolean> {
    const answer = await this.question(chalk.yellow(`${query} (y/N): `));
    return answer.toLowerCase() === 'y';
  }

  /**
   * Display a spinner animation during async operations
   */
  showSpinner(text: string): Spinner {
    return this.verbosity.showSpinner ? 
      this.verbosity.showSpinner(text) : 
      this.createSpinner(text);
  }

  /**
   * Create a spinner animation
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

  /**
   * Parse command line arguments
   */
  parseCommandLineArgs() {
    const args = process.argv.slice(2);
    const result = {
      environment: null as string | null,
      platform: null as string | null,
      action: null as string | null,
      operation: null as string | null,
      serverOption: null as string | null,
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
   */
  async handleSpecialCommands(input: string, currentStep: string): Promise<boolean> {
    const normalizedInput = input.toLowerCase().trim();

    // Handle exit/quit command
    if (normalizedInput === 'exit' || normalizedInput === 'quit') {
      const shouldExit = await this.confirm('Are you sure you want to exit?');
      if (shouldExit) {
        console.log(chalk.gray('Exiting application...'));
        (global as any).rl.close();
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
   */
  async executeCommand(
    command: string,
    description: string,
    options: Record<string, any> = {}
  ): Promise<string> {
    return this.verbosity.executeCommand(command, description, options);
  }

  /**
   * Filter simulators to keep only the highest OS version for each model
   *
   * @param simulators Array of simulator devices
   * @returns Filtered simulators with only highest OS version per model
   */
  filterSimulatorsByHighestOSVersion(simulators: DeviceInfo[]): DeviceInfo[] {
    // Create a map to group simulators by model name
    const modelGroups: Record<string, DeviceInfo[]> = {};

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
} 