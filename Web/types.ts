/**
 * Web Module Types
 *
 * This file contains type definitions specific to the Web platform module.
 */

/**
 * WebHandler
 *
 * Interface defining the methods required for Web platform operations
 */
export interface WebHandler {
  /**
   * Set up Web environment
   *
   * @param environment - The target environment (development, staging, production)
   * @returns Promise resolving to setup success status
   */
  setupEnvironment(environment: string): Promise<boolean>;

  /**
   * Execute debug command (development server)
   *
   * @param environment - The target environment
   * @returns Promise resolving to execution success status
   */
  executeDebug(environment: string): Promise<boolean>;

  /**
   * Execute build command
   *
   * @param environment - The target environment
   * @returns Promise resolving to execution success status
   */
  executeBuild(environment: string): Promise<boolean>;

  /**
   * Execute deploy command
   *
   * @param environment - The target environment
   * @returns Promise resolving to execution success status
   */
  executeDeploy(environment: string): Promise<boolean>;

  /**
   * Run diagnostics when errors occur
   *
   * @returns Promise resolving to diagnostic results
   */
  runDiagnostics(): Promise<string>;
}
