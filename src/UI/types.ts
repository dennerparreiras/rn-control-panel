/**
 * UI Module Types
 *
 * This file contains type definitions for the UI module.
 */

import { MenuOption } from '../types';

/**
 * User Interface
 *
 * Interface for UI controller
 */
export interface UserInterface {
  displayDashboard(): void;
  showMainMenu(): Promise<string>;
  showMenu(
    title: string,
    options: MenuOption[],
    step: string,
    currentPlatform?: string
  ): Promise<string>;
  showSpecialCommandsHelp(): void;
  showConfigSummary(
    environment: string,
    platform: string,
    action: string
  ): string;
  displayCommandLineUsage(): void;
  getPackageInfo(): any;
  checkEnvFile(): { exists: boolean; type: string | null };
  checkEnvironmentTemplates(): Record<string, boolean>;
} 