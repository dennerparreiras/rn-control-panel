/**
 * ReactNative Module Types
 *
 * This file contains type definitions specific to the React Native module.
 */

/**
 * ServerOptions
 */
export type ServerOptions = 'standard' | 'fresh';

/**
 * ReactNativeHandler
 *
 * Interface defining the methods required for React Native operations
 */
export interface ReactNativeHandler {
  /**
   * Start the React Native server
   *
   * @param options - Server start options
   * @returns Promise resolving to start success status
   */
  startServer(options: ServerOptions): Promise<boolean>;

  /**
   * Stop the React Native server
   *
   * @returns Promise resolving to stop success status
   */
  stopServer(): Promise<boolean>;

  /**
   * Check if the React Native server is running
   *
   * @returns Promise resolving to running status
   */
  isServerRunning(): Promise<boolean>;

  /**
   * Clean the React Native cache
   *
   * @returns Promise resolving to clean success status
   */
  cleanCache(): Promise<boolean>;
}
