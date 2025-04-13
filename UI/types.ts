/**
 * UI Module Types
 *
 * This file contains type definitions specific to the user interface module.
 */

import { MenuOption } from '../types';

/**
 * UserInterface
 *
 * Interface defining the methods required for control panel user interface
 */
export interface UserInterface {
  /**
   * Display a menu and get user selection
   *
   * @param title - Menu title
   * @param options - Array of menu options
   * @param step - Current step name (for special commands)
   * @param currentPlatform - Current platform (for platform-specific descriptions)
   * @returns Promise resolving to selected option key
   */
  showMenu(
    title: string,
    options: MenuOption[],
    step: string,
    currentPlatform?: string
  ): Promise<string>;

  /**
   * Display main menu options
   *
   * @returns Promise resolving to selected option key
   */
  showMainMenu(): Promise<string>;

  /**
   * Display special commands help
   */
  showSpecialCommandsHelp(): void;

  /**
   * Display configuration summary
   *
   * @param environment - Environment code (d, s, p)
   * @param platform - Platform code (i, a, w)
   * @param action - Action code (d, r, b, p, e)
   * @returns Environment name
   */
  showConfigSummary(environment: string, platform: string, action: string): string;

  /**
   * Display a spinner animation
   *
   * @param text - Text to display next to spinner
   * @returns Spinner control object
   */
  showSpinner(text: string): Spinner;

  /**
   * Style a title banner
   *
   * @param text - Banner text
   */
  titleBanner(text: string): void;

  /**
   * Style a section header
   *
   * @param text - Header text
   */
  sectionHeader(text: string): void;

  /**
   * Display a frame line
   */
  frameLine(): void;

  /**
   * Display an info item (key/value pair)
   *
   * @param key - Item key
   * @param value - Item value
   * @param color - Color name for value
   */
  infoItem(key: string, value: string, color?: string): void;

  /**
   * Style a warning message
   *
   * @param text - Warning text
   * @returns Styled warning
   */
  warning(text: string): string;

  /**
   * Style an error message
   *
   * @param text - Error text
   * @returns Styled error
   */
  error(text: string): string;

  /**
   * Style a success message
   *
   * @param text - Success text
   * @returns Styled success
   */
  success(text: string): string;

  /**
   * Style an info message
   *
   * @param text - Info text
   * @returns Styled info
   */
  info(text: string): string;
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
 * ConfirmOptions
 *
 * Options for confirmation prompts
 */
export interface ConfirmOptions {
  defaultValue?: boolean;
  yesText?: string;
  noText?: string;
}

/**
 * CommandLineHelpSection
 *
 * Section of command line help
 */
export interface CommandLineHelpSection {
  title: string;
  options: CommandLineHelpOption[];
}

/**
 * CommandLineHelpOption
 *
 * Option in command line help
 */
export interface CommandLineHelpOption {
  flag: string;
  description: string;
}
