/**
 * Environment Module Types
 *
 * This file contains type definitions specific to the environment management module.
 */

/**
 * EnvironmentManager
 *
 * Interface defining the methods required for environment operations
 */
export interface EnvironmentManager {
  /**
   * Check if an environment file exists
   *
   * @param environment - The environment name (development, staging, production)
   * @returns Boolean indicating if the environment file exists
   */
  checkEnvironmentFile(environment: string): boolean;

  /**
   * Generate .env file from template
   *
   * @param environment - The environment name (development, staging, production)
   * @returns Promise resolving to generation success status
   */
  generateEnvFile(environment: string): Promise<boolean>;

  /**
   * Get available environment templates
   *
   * @returns Object with status of each environment template
   */
  checkEnvironmentTemplates(): EnvironmentTemplates;

  /**
   * Get current environment from .env file
   *
   * @returns Object with environment status and type
   */
  getCurrentEnvironment(): EnvironmentInfo;

  /**
   * Set up environment for a specific platform
   *
   * @param environment - The environment name
   * @param platform - The platform code (i, a, w)
   * @returns Promise resolving to setup success status
   */
  setupPlatformEnvironment(environment: string, platform: string): Promise<boolean>;
}

/**
 * Environment Templates Status
 *
 * Object containing status of each environment template
 */
export interface EnvironmentTemplates {
  development: boolean;
  staging: boolean;
  production: boolean;
}

/**
 * Environment Information
 *
 * Object containing environment information
 */
export interface EnvironmentInfo {
  exists: boolean;
  type: string | null;
  path?: string;
}
