/**
 * Utils Module Types
 *
 * This file contains type definitions specific to the utilities module.
 */

import { DeviceInfo, EnvironmentStatus, CommandLineArgs } from '../types';

/**
 * Utilities
 *
 * Interface defining utility methods used across the control panel
 */
export interface Utilities {
  /**
   * Promise-based readline question
   *
   * @param query - Question to ask
   * @returns Promise resolving to user's answer
   */
  question(query: string): Promise<string>;

  /**
   * Ask for confirmation (y/n)
   *
   * @param query - Question to ask
   * @param options - Confirmation options
   * @returns Promise resolving to user's confirmation
   */
  confirm(query: string, options?: ConfirmOptions): Promise<boolean>;

  /**
   * Display a spinner animation during async operations
   *
   * @param text - Text to display with spinner
   * @returns Spinner control object
   */
  showSpinner(text: string): Spinner;

  /**
   * Parse command line arguments
   *
   * @returns Parsed command line arguments
   */
  parseCommandLineArgs(): CommandLineArgs;

  /**
   * Handle special commands in user input
   *
   * @param input - User input
   * @param currentStep - Current step name
   * @returns Promise resolving to whether input was handled
   */
  handleSpecialCommands(input: string, currentStep: string): Promise<boolean>;

  /**
   * Execute a shell command with a spinner
   *
   * @param command - Command to execute
   * @param description - Description of command for spinner
   * @param options - Child process execution options
   * @returns Promise resolving to command output
   */
  executeCommand(
    command: string,
    description: string,
    options?: ExecuteCommandOptions
  ): Promise<string>;

  /**
   * Filter simulators to keep only the highest OS version for each model
   *
   * @param simulators - Array of simulator devices
   * @returns Filtered simulators
   */
  filterSimulatorsByHighestOSVersion(simulators: DeviceInfo[]): DeviceInfo[];

  /**
   * Load and parse package.json data
   *
   * @returns Package.json data
   */
  getPackageInfo(): any;

  /**
   * Check if an environment file exists and what environment it's for
   *
   * @returns Environment status
   */
  checkEnvFile(): EnvironmentStatus;

  /**
   * Read a file asynchronously
   *
   * @param filePath - Path to file
   * @param encoding - File encoding
   * @returns Promise resolving to file contents
   */
  readFile(filePath: string, encoding?: string): Promise<string>;

  /**
   * Write a file asynchronously
   *
   * @param filePath - Path to file
   * @param content - File content
   * @param encoding - File encoding
   * @returns Promise resolving to success status
   */
  writeFile(filePath: string, content: string, encoding?: string): Promise<boolean>;
}

/**
 * Verbosity Control
 *
 * Interface for controlling log verbosity
 */
export interface VerbosityControl {
  /**
   * Initialize verbosity settings from command line args
   */
  init(): void;

  /**
   * Log message only if verbose mode is enabled
   *
   * @param message - Message to log
   */
  log(message: string): void;

  /**
   * Log error message (always shown)
   *
   * @param message - Error message to log
   */
  error(message: string): void;

  /**
   * Run command with appropriate verbosity
   *
   * @param command - Command to execute
   * @param description - Description of command
   * @param options - Child process execution options
   * @returns Promise resolving to command output
   */
  executeCommand(
    command: string,
    description: string,
    options?: ExecuteCommandOptions
  ): Promise<string>;
}

/**
 * Execute Command Options
 *
 * Options for command execution
 */
export interface ExecuteCommandOptions {
  maxBuffer?: number;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  stdio?: 'inherit' | 'pipe' | 'ignore';
  shell?: boolean;
  [key: string]: any;
}

/**
 * Spinner
 *
 * Interface for spinner animation control
 */
export interface Spinner {
  /**
   * Update spinner text
   *
   * @param newText - New text to display
   */
  update(newText: string): void;

  /**
   * Stop spinner animation
   *
   * @param finalText - Final text to display (optional)
   */
  stop(finalText?: string): void;
}

/**
 * Confirmation Options
 *
 * Options for confirmation prompts
 */
export interface ConfirmOptions {
  defaultValue?: boolean;
  yesText?: string;
  noText?: string;
}
