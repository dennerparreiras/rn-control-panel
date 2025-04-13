/**
 * Utils Module Types
 *
 * This file contains the type definitions for the Utils module.
 */

import { DeviceInfo, Spinner } from '../types';

/**
 * Verbosity Control Interface
 *
 * Defines the methods for managing verbose logging
 */
export interface VerbosityControl {
  isVerbose: boolean;
  init(): void;
  log(message: string): void;
  error(message: string): void;
  executeCommand(
    command: string,
    description: string,
    options?: Record<string, any>
  ): Promise<string>;
}

/**
 * Utilities Interface
 *
 * Defines the utility methods available in the project
 */
export interface Utilities {
  verbosity: VerbosityControl;
  question(query: string): Promise<string>;
  confirm(query: string): Promise<boolean>;
  showSpinner(text: string): Spinner;
  executeCommand(
    command: string,
    description: string,
    options?: Record<string, any>
  ): Promise<string>;
  handleSpecialCommands(input: string, currentStep: string): Promise<boolean>;
  parseCommandLineArgs(): {
    environment: string | null;
    platform: string | null;
    action: string | null;
    operation: string | null;
    serverOption: string | null;
    verbose: boolean;
  };
  filterSimulatorsByHighestOSVersion(simulators: DeviceInfo[]): DeviceInfo[];
} 