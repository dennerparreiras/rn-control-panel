/**
 * UI Module
 *
 * This module provides the user interface components for the control panel.
 */

import chalk from 'chalk';
import { UserInterface, Spinner } from './types';
import { 
  ControlPanelConfig, 
  MenuOption, 
  EnvironmentStatus,
  UITheme
} from '../types';
import { Utils } from '../Utils';

/**
 * UIController
 *
 * Implementation of user interface methods for the control panel
 */
export class UIController implements UserInterface {
  private config: ControlPanelConfig;
  private utils: Utils;
  public theme: UITheme;

  /**
   * Constructor
   *
   * @param config - Control panel configuration
   * @param utils - Utilities instance
   */
  constructor(config: ControlPanelConfig, utils: Utils) {
    this.config = config;
    this.utils = utils;
    this.theme = this.initTheme();
  }

  /**
   * Initialize UI theme based on configuration
   *
   * @returns Configured UI theme
   */
  private initTheme(): UITheme {
    return {
      titleBanner: (text: string) => {
        console.log('\n' + chalk.bold.bgBlue.white(` ${text} `) + '\n');
      },
      sectionHeader: (text: string) => {
        console.log('\n' + chalk.bold.cyan(`◉ ${text}`) + '\n');
      },
      frameLine: () => {
        console.log(
          chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        );
      },
      infoItem: (key: string, value: string, color: string = 'white') => {
        const keyWidth = 25;
        const paddedKey = key.padEnd(keyWidth);
        if (color === 'green') {
          console.log(`  ${chalk.dim(paddedKey)} │ ${chalk.green(value)}`);
        } else if (color === 'yellow') {
          console.log(`  ${chalk.dim(paddedKey)} │ ${chalk.yellow(value)}`);
        } else if (color === 'red') {
          console.log(`  ${chalk.dim(paddedKey)} │ ${chalk.red(value)}`);
        } else if (color === 'blue') {
          console.log(`  ${chalk.dim(paddedKey)} │ ${chalk.blue(value)}`);
        } else if (color === 'cyan') {
          console.log(`  ${chalk.dim(paddedKey)} │ ${chalk.cyan(value)}`);
        } else if (color === 'magenta') {
          console.log(`  ${chalk.dim(paddedKey)} │ ${chalk.magenta(value)}`);
        } else if (color === 'gray') {
          console.log(`  ${chalk.dim(paddedKey)} │ ${chalk.gray(value)}`);
        } else {
          console.log(`  ${chalk.dim(paddedKey)} │ ${chalk.white(value)}`);
        }
      },
      statusEnabled: this.config.ui.status_enabled,
      statusDisabled: this.config.ui.status_disabled,
      warning: (text: string) => chalk.yellow(`⚠ ${text}`),
      error: (text: string) => chalk.red(`✘ ${text}`),
      success: (text: string) => chalk.green(`✓ ${text}`),
      info: (text: string) => chalk.cyan(`ℹ ${text}`)
    };
  }

  /**
   * Display a menu and get user selection
   *
   * @param title - Menu title
   * @param options - Array of menu options
   * @param step - Current step name (for special commands)
   * @param currentPlatform - Current platform (for platform-specific descriptions)
   * @returns Promise resolving to selected option key
   */
  public async showMenu(
    title: string,
    options: MenuOption[],
    step: string,
    currentPlatform: string = ''
  ): Promise<string> {
    // Display the menu title
    console.log(chalk.bold.cyan(`\n${title}`));
    this.theme.frameLine();

    // Display options with the new format - letter in brackets
    options.forEach((option) => {
      let coloredText;
      
      switch(option.color) {
        case 'green':
          coloredText = chalk.green(`[ ${option.key.toUpperCase()} ]`);
          break;
        case 'yellow':
          coloredText = chalk.yellow(`[ ${option.key.toUpperCase()} ]`);
          break;
        case 'red':
          coloredText = chalk.red(`[ ${option.key.toUpperCase()} ]`);
          break;
        case 'blue':
          coloredText = chalk.blue(`[ ${option.key.toUpperCase()} ]`);
          break;
        case 'cyan':
          coloredText = chalk.cyan(`[ ${option.key.toUpperCase()} ]`);
          break;
        case 'magenta':
          coloredText = chalk.magenta(`[ ${option.key.toUpperCase()} ]`);
          break;
        case 'gray':
          coloredText = chalk.gray(`[ ${option.key.toUpperCase()} ]`);
          break;
        default:
          coloredText = chalk.white(`[ ${option.key.toUpperCase()} ]`);
      }
      
      console.log(`${option.icon || '•'} ${coloredText}  ${option.label}`);
    });
    this.theme.frameLine();

    // Show descriptions for each option
    console.log(''); // Empty line before descriptions
    options.forEach((option) => {
      // Handle descriptions that might be platform-specific objects
      let description = option.description;

      // If description is an object with platform-specific texts
      if (
        description &&
        typeof description === 'object' &&
        !Array.isArray(description)
      ) {
        // Default to using any platform description if available
        const platformKey = currentPlatform || 'ios'; // Default to iOS if platform not yet selected
        description = description[platformKey] || Object.values(description)[0];
      }

      if (description) {
        console.log(`${option.label} - ${description}`);
      }
    });
    console.log(''); // Empty line after descriptions

    // Get user selection
    let selection: string = '';
    const validKeys = options.map((opt) => opt.key.toLowerCase());

    while (!validKeys.includes(selection.toLowerCase())) {
      const answer = await this.utils.question(chalk.yellow('→ Your choice: '));
      selection = answer || '';

      // Check for special commands first
      if (await this.utils.handleSpecialCommands(selection, step)) {
        // If this was a skip command, return the default option key
        if (selection.toLowerCase() === 'skip') {
          selection = options[0].key; // Use first option as default
          break;
        }
        // If it was exit/quit but user chose not to exit, ask again
        continue;
      }

      if (!validKeys.includes(selection.toLowerCase())) {
        console.log(chalk.red('⚠ Invalid selection. Please try again.'));
      }
    }

    // Find and return the selected option (case insensitive matching)
    const selectedOption = options.find(
      (opt) => opt.key.toLowerCase() === selection.toLowerCase()
    );
    
    if (selectedOption) {
      console.log(chalk.green(`✓ Selected: ${selectedOption.label}\n`));
      return selectedOption.key.toLowerCase();
    }
    
    // This should not happen if validation works correctly
    return options[0].key.toLowerCase();
  }

  /**
   * Display main menu options
   *
   * @returns Promise resolving to selected option key
   */
  public async showMainMenu(): Promise<string> {
    const mainMenuOptions = [
      { key: 'V', label: 'Just version the app', color: 'blue' },
      { key: 'E', label: 'Just switch environment', color: 'yellow' },
      { key: 'S', label: 'Start React Native server', color: 'green' },
      {
        key: 'D',
        label: 'Proceed to development (current environment)',
        color: 'green',
      },
      {
        key: 'W',
        label: 'Switch environment and proceed to development',
        color: 'cyan',
      },
      {
        key: 'A',
        label: 'Version, switch environment, and proceed to development',
        color: 'magenta',
      },
      { key: 'X', label: 'Exit', color: 'gray' },
    ];

    return await this.showMenu(
      'Select Operation:',
      mainMenuOptions,
      'main menu'
    );
  }

  /**
   * Display special commands help
   */
  public showSpecialCommandsHelp(): void {
    console.log(chalk.cyan('📝 Special commands you can use at any prompt:'));
    console.log(chalk.cyan('• Type "exit" or "quit" to exit the application'));
    console.log(
      chalk.cyan(
        '• Type "skip" to use the default selection for the current step'
      )
    );
    console.log(
      chalk.cyan('• Both uppercase and lowercase input are accepted\n')
    );
  }

  /**
   * Display configuration summary
   *
   * @param environment - Environment code (d, s, p)
   * @param platform - Platform code (i, a, w)
   * @param action - Action code (d, r, b, p, e)
   * @returns Environment name
   */
  public showConfigSummary(environment: string, platform: string, action: string): string {
    // Convert short codes to display labels
    const envName =
      environment === 'd'
        ? 'development'
        : environment === 's'
          ? 'staging'
          : 'production';

    // Display summary of selections with colors
    console.log(chalk.bold('\n📋 Configuration Summary:'));
    console.log(chalk.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(
      `🌍 ${chalk.bold('Environment')}: ${
        environment === 'd'
          ? chalk.green('Development')
          : environment === 's'
            ? chalk.yellow('Staging')
            : chalk.red('Production')
      }`
    );
    console.log(
      `📱 ${chalk.bold('Platform')}: ${
        platform === 'i'
          ? chalk.blue('iOS')
          : platform === 'a'
            ? chalk.green('Android')
            : chalk.cyan('Web')
      }`
    );

    // Display action with appropriate label
    let actionLabel, actionColor;
    if (action === 'd') {
      actionLabel = 'Debug';
      actionColor = 'magenta';
    } else if (action === 'r') {
      actionLabel = 'Release';
      actionColor = 'yellow';
    } else if (action === 'b') {
      actionLabel = 'Build';
      actionColor = 'blue';
    } else if (action === 'p') {
      actionLabel = 'Deploy';
      actionColor = 'cyan';
    } else {
      actionLabel = 'Exit';
      actionColor = 'gray';
    }

    // Use direct method calls instead of dynamic property access
    let coloredLabel: string;
    switch (actionColor) {
      case 'magenta':
        coloredLabel = chalk.magenta(actionLabel);
        break;
      case 'yellow':
        coloredLabel = chalk.yellow(actionLabel);
        break;
      case 'blue':
        coloredLabel = chalk.blue(actionLabel);
        break;
      case 'cyan':
        coloredLabel = chalk.cyan(actionLabel);
        break;
      case 'gray':
        coloredLabel = chalk.gray(actionLabel);
        break;
      default:
        coloredLabel = chalk.white(actionLabel);
    }

    console.log(
      `🔧 ${chalk.bold('Action')}: ${coloredLabel}`
    );
    console.log(chalk.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    return envName;
  }

  /**
   * Display a spinner animation
   *
   * @param text - Text to display next to spinner
   * @returns Spinner control object
   */
  public showSpinner(text: string): Spinner {
    return this.utils.showSpinner(text);
  }

  /**
   * Style a title banner
   *
   * @param text - Banner text
   */
  public titleBanner(text: string): void {
    this.theme.titleBanner(text);
  }

  /**
   * Style a section header
   *
   * @param text - Header text
   */
  public sectionHeader(text: string): void {
    this.theme.sectionHeader(text);
  }

  /**
   * Display a frame line
   */
  public frameLine(): void {
    this.theme.frameLine();
  }

  /**
   * Display an info item (key/value pair)
   *
   * @param key - Item key
   * @param value - Item value
   * @param color - Color name for value
   */
  public infoItem(key: string, value: string, color?: string): void {
    this.theme.infoItem(key, value, color);
  }

  /**
   * Style a warning message
   *
   * @param text - Warning text
   * @returns Styled warning
   */
  public warning(text: string): string {
    return this.theme.warning(text);
  }

  /**
   * Style an error message
   *
   * @param text - Error text
   * @returns Styled error
   */
  public error(text: string): string {
    return this.theme.error(text);
  }

  /**
   * Style a success message
   *
   * @param text - Success text
   * @returns Styled success
   */
  public success(text: string): string {
    return this.theme.success(text);
  }

  /**
   * Style an info message
   *
   * @param text - Info text
   * @returns Styled info
   */
  public info(text: string): string {
    return this.theme.info(text);
  }

  /**
   * Display project information and environment status in a dashboard
   */
  public displayDashboard(): void {
    // Get project information
    const pkg = this.utils.getPackageInfo();
    const envStatus = this.utils.checkEnvFile();
    const envTemplates = this.getEnvironmentTemplates();

    this.theme.titleBanner(this.config.ui.title_banner);

    // Project information section
    this.theme.sectionHeader('Project Information');
    this.theme.frameLine();
    this.theme.infoItem('PROJECT NAME', pkg.name || 'unknown', 'blue');
    this.theme.infoItem('COMPANY NAME', pkg.company || 'unknown', 'blue');
    this.theme.infoItem(
      'CURRENT APP VERSION',
      pkg.version || 'unknown',
      'green'
    );
    this.theme.infoItem(
      'CURRENT ANDROID BUILD',
      pkg.metadataApp?.versionCode || 'unknown',
      'yellow'
    );
    this.theme.frameLine();

    // Environment status section
    this.theme.sectionHeader('Environment Status');
    this.theme.frameLine();

    // Check if .env file exists
    if (envStatus.exists) {
      this.theme.infoItem('.ENV FILE STATUS', 'Generated', 'green');
      if (envStatus.type) {
        this.theme.infoItem(
          'CONFIGURED FOR',
          envStatus.type.toUpperCase(),
          envStatus.type === 'production'
            ? 'red'
            : envStatus.type === 'staging'
              ? 'yellow'
              : 'green'
        );
      } else {
        this.theme.infoItem('CONFIGURED FOR', 'Unknown environment', 'gray');
      }
    } else {
      this.theme.infoItem('.ENV FILE STATUS', 'Not generated', 'red');
    }

    // Check environment templates
    this.theme.infoItem(
      'DEVELOPMENT TEMPLATE',
      envTemplates.development
        ? this.theme.statusEnabled + ' Available'
        : this.theme.statusDisabled + ' Missing',
      envTemplates.development ? 'green' : 'red'
    );

    this.theme.infoItem(
      'STAGING TEMPLATE',
      envTemplates.staging
        ? this.theme.statusEnabled + ' Available'
        : this.theme.statusDisabled + ' Missing',
      envTemplates.staging ? 'green' : 'red'
    );

    this.theme.infoItem(
      'PRODUCTION TEMPLATE',
      envTemplates.production
        ? this.theme.statusEnabled + ' Available'
        : this.theme.statusDisabled + ' Missing',
      envTemplates.production ? 'green' : 'red'
    );

    this.theme.frameLine();
    console.log('');
  }

  /**
   * Get environment template status
   * 
   * @returns Status of each environment template file
   */
  private getEnvironmentTemplates() {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const envSourcePath = path.resolve(process.cwd(), 'environment');
      
      const results = {
        development: fs.existsSync(
          path.join(envSourcePath, '.env.development')
        ),
        staging: fs.existsSync(
          path.join(envSourcePath, '.env.staging')
        ),
        production: fs.existsSync(
          path.join(envSourcePath, '.env.production')
        ),
      };

      return results;
    } catch (error) {
      console.error(
        this.theme.error(
          `Failed to check environment templates: ${(error as Error).message}`
        )
      );
      return { development: false, staging: false, production: false };
    }
  }

  /**
   * Get environment options for menu
   * 
   * @returns Menu options for environment selection
   */
  public getEnvironmentOptions(): MenuOption[] {
    return [
      {
        key: 'D',
        label: 'Development',
        color: 'green',
        icon: '🚧',
        description:
          'Use this environment for local development and testing. Features may be unstable and APIs will connect to development servers.',
      },
      {
        key: 'S',
        label: 'Staging',
        color: 'yellow',
        icon: '🚦',
        description:
          'Testing environment that mirrors production. Use this to test your changes in a production-like setting before final release.',
      },
      {
        key: 'P',
        label: 'Production',
        color: 'red',
        icon: '🚀',
        description:
          'Live environment used by end users. All features should be stable and fully tested before deploying here.',
      },
    ];
  }

  /**
   * Get platform options for menu
   * 
   * @returns Menu options for platform selection
   */
  public getPlatformOptions(): MenuOption[] {
    return [
      {
        key: 'I',
        label: 'iOS',
        color: 'blue',
        icon: '🍏',
        description: 'Apple iOS platform for iPhone and iPad devices.',
      },
      {
        key: 'A',
        label: 'Android',
        color: 'green',
        icon: '🤖',
        description: 'Android platform for various mobile devices and tablets.',
      },
      {
        key: 'W',
        label: 'Web',
        color: 'cyan',
        icon: '🌐',
        description: 'Browser-based web application platform.',
      },
    ];
  }

  /**
   * Get standard action options for menu
   * 
   * @returns Menu options for standard action selection
   */
  public getStandardActionOptions(): MenuOption[] {
    return [
      {
        key: 'D',
        label: 'Debug',
        color: 'magenta',
        icon: '🐛',
        description: {
          ios: 'Run the app on a selected iOS device or simulator with debug capabilities enabled.',
          android:
            'Run the app on a connected Android device or emulator with debug options enabled.',
          web: 'Start the development server with hot reloading and debugging tools.',
        },
      },
      {
        key: 'R',
        label: 'Release',
        color: 'yellow',
        icon: '📱',
        description: {
          ios: 'Run the app on a device or simulator in release mode with optimizations enabled.',
          android:
            'Run the app on a device or emulator in release mode with optimizations and ProGuard enabled.',
          web: 'Not applicable for web platform.',
        },
      },
      {
        key: 'B',
        label: 'Build',
        color: 'blue',
        icon: '📦',
        description: {
          ios: 'Build the iOS app for distribution. Opens Xcode for final archive steps.',
          android:
            'Build APK and AAB files for distribution through Play Store or direct installation.',
          web: 'Build static files for deployment to web servers or CDNs.',
        },
      },
      {
        key: 'E',
        label: 'Exit',
        color: 'gray',
        icon: '🚪',
        description: 'Exit the current menu and return to the previous step.',
      },
    ];
  }

  /**
   * Get web action options for menu
   * 
   * @returns Menu options for web action selection
   */
  public getWebActionOptions(): MenuOption[] {
    return [
      {
        key: 'D',
        label: 'Debug (Development Server)',
        color: 'magenta',
        icon: '🐛',
        description:
          'Start the webpack development server with hot reloading and source maps for debugging.',
      },
      {
        key: 'B',
        label: 'Build',
        color: 'blue',
        icon: '📦',
        description:
          'Build optimized static files for deployment to web servers or CDNs.',
      },
      {
        key: 'P',
        label: 'Deploy (Build & Bundle)',
        color: 'yellow',
        icon: '🚀',
        description:
          'Build and prepare a complete deployment package including well-known files for hosting.',
      },
      {
        key: 'E',
        label: 'Exit',
        color: 'gray',
        icon: '🚪',
        description: 'Exit the current menu and return to the previous step.',
      },
    ];
  }
}

// Exportar os tipos também
export * from './types'; 