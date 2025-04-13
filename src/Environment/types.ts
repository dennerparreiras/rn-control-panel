/**
 * Environment Module Types
 *
 * This file contains type definitions for the Environment module.
 */

/**
 * Environment Manager Interface
 *
 * Define the interface for the environment manager
 */
export interface EnvironmentManager {
  /**
   * Check Environment File
   *
   * Verifies if the specified environment file exists
   *
   * @param environment Environment name
   * @returns Whether the environment file exists
   */
  checkEnvironmentFile(environment: string): boolean;

  /**
   * Generate Env File
   *
   * Generates a .env file from a template for the specified environment
   *
   * @param environment Environment name to generate
   * @returns Promise resolving to success status
   */
  generateEnvFile(environment: string): Promise<boolean>;
} 