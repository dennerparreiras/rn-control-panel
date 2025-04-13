/**
 * UI Module
 * 
 * This module provides user interface functionality for the control panel,
 * including menus, dashboard, and other visual elements.
 */

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { 
  ControlPanelConfig, 
  MenuOption, 
  UIConfigOptions,
  UITheme,
  AppInfo,
  EnvironmentStatus
} from '../types';
import { Utilities } from '../Utils/types';

/**
 * UI Controller
 * 
 * Manages all UI interactions and display elements for the control panel
 */
export class UIController {
  private config: ControlPanelConfig;
  private utils: Utilities;
  private theme: UITheme;
  private options: UIConfigOptions;

  /**
   * Constructor
   * 
   * @param config Control panel configuration
   * @param utils Utility functions
   */
  constructor(config: ControlPanelConfig, utils: Utilities) {
    this.config = config;
    this.utils = utils;
    this.theme = this.createUITheme();
    this.options = this.createConfigOptions();
  }

  /**
   * Create UI Theme
   * 
   * Creates theme functions for consistent UI appearance
   * 
   * @returns UI theme object
   */
  private createUITheme(): UITheme {
    return {
      // Banner style for project title
      titleBanner: (text: string) =>
        console.log('\n' + chalk.bold.bgBlue.white(` ${text} `) + '\n'),

      // Section header style
      sectionHeader: (text: string) =>
        console.log('\n' + chalk.bold.cyan(`◉ ${text}`) + '\n'),

      // Frame around information blocks
      frameLine: () =>
        console.log(
          chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'),
        ),

      // Info item style (key/value pairs)
      infoItem: (key: string, value: string, color = 'white') => {
        const keyWidth = 25;
        const paddedKey = key.padEnd(keyWidth);
        console.log(`  ${chalk.dim(paddedKey)} │ ${chalk[color as keyof typeof chalk](value)}`);
      },

      // Status indicators
      statusEnabled: this.config.ui.status_enabled || chalk.green('✓'),
      statusDisabled: this.config.ui.status_disabled || chalk.red('✗'),

      // Special styles
      warning: (text: string) => chalk.yellow(`⚠ ${text}`),
      error: (text: string) => chalk.red(`✘ ${text}`),
      success: (text: string) => chalk.green(`✓ ${text}`),
      info: (text: string) => chalk.cyan(`ℹ ${text}`),
    };
  }

  /**
   * Create Configuration Options
   * 
   * Creates menu options for various selections
   * 
   * @returns Configuration options object
   */
  private createConfigOptions(): UIConfigOptions {
    return {
      environment: [
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
      ],
      platform: [
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
      ],
      actionStandard: [
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
      ],
      actionWeb: [
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
      ],
    };
  }

  /**
   * Get Package Info
   * 
   * Load and parse package.json data
   * 
   * @returns Package information
   */
  getPackageInfo(): AppInfo {
    try {
      const packageJson = fs.readFileSync(
        path.resolve(process.cwd(), 'package.json'),
        'utf8',
      );
      return JSON.parse(packageJson);
    } catch (error) {
      console.error(
        this.theme.error(`Failed to read package.json: ${(error as Error).message}`),
      );
      return {
        name: 'unknown',
        version: 'unknown',
        company: 'unknown',
        metadataApp: { versionCode: 0 },
      };
    }
  }

  /**
   * Check Env File
   * 
   * Check if an environment file exists and what environment it's for
   * 
   * @returns Environment status information
   */
  checkEnvFile(): EnvironmentStatus {
    try {
      const envTargetPath = path.resolve(process.cwd(), '.env');
      const envExists = fs.existsSync(envTargetPath);
      let envType = null;

      if (envExists) {
        const envContent = fs.readFileSync(envTargetPath, 'utf8');

        // Try to determine which environment it is based on content
        if (
          envContent.includes('ENV=development') ||
          envContent.includes('ENVIRONMENT=development')
        ) {
          envType = 'development';
        } else if (
          envContent.includes('ENV=staging') ||
          envContent.includes('ENVIRONMENT=staging')
        ) {
          envType = 'staging';
        } else if (
          envContent.includes('ENV=production') ||
          envContent.includes('ENVIRONMENT=production')
        ) {
          envType = 'production';
        }
      }

      return { exists: envExists, type: envType };
    } catch (error) {
      console.error(
        this.theme.error(`Failed to check environment file: ${(error as Error).message}`),
      );
      return { exists: false, type: null };
    }
  }

  /**
   * Check Environment Templates
   * 
   * Check if environment template files exist
   * 
   * @returns Information about available environment templates
   */
  checkEnvironmentTemplates(): Record<string, boolean> {
    try {
      const environmentPath = path.resolve(process.cwd(), 'environment');
      const results = {
        development: fs.existsSync(
          path.join(environmentPath, '.env.development'),
        ),
        staging: fs.existsSync(
          path.join(environmentPath, '.env.staging'),
        ),
        production: fs.existsSync(
          path.join(environmentPath, '.env.production'),
        ),
      };

      return results;
    } catch (error) {
      console.error(
        this.theme.error(
          `Failed to check environment templates: ${(error as Error).message}`,
        ),
      );
      return { development: false, staging: false, production: false };
    }
  }

  /**
   * Display Dashboard
   * 
   * Display project information and environment status in a dashboard
   */
  displayDashboard(): void {
    // Get project information
    const pkg = this.getPackageInfo();
    const envStatus = this.checkEnvFile();
    const envTemplates = this.checkEnvironmentTemplates();

    this.theme.titleBanner(this.config.ui.title_banner);

    // Project information section
    this.theme.sectionHeader('Project Information');
    this.theme.frameLine();
    this.theme.infoItem('PROJECT NAME', pkg.name || 'unknown', 'blue');
    this.theme.infoItem('COMPANY NAME', pkg.company || 'unknown', 'blue');
    this.theme.infoItem(
      'CURRENT APP VERSION',
      pkg.version || 'unknown',
      'green',
    );
    this.theme.infoItem(
      'CURRENT ANDROID BUILD',
      pkg.metadataApp?.versionCode?.toString() || 'unknown',
      'yellow',
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
              : 'green',
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
      envTemplates.development ? 'green' : 'red',
    );

    this.theme.infoItem(
      'STAGING TEMPLATE',
      envTemplates.staging
        ? this.theme.statusEnabled + ' Available'
        : this.theme.statusDisabled + ' Missing',
      envTemplates.staging ? 'green' : 'red',
    );

    this.theme.infoItem(
      'PRODUCTION TEMPLATE',
      envTemplates.production
        ? this.theme.statusEnabled + ' Available'
        : this.theme.statusDisabled + ' Missing',
      envTemplates.production ? 'green' : 'red',
    );

    this.theme.frameLine();
    console.log('');
  }

  /**
   * Show Menu
   * 
   * Display a menu and get user selection with improved formatting
   * 
   * @param title Menu title
   * @param options Menu options
   * @param step Current step (for skip handling)
   * @param currentPlatform Current platform
   * @returns Selected option key
   */
  async showMenu(
    title: string,
    options: MenuOption[],
    step: string,
    currentPlatform = ''
  ): Promise<string> {
    // Display the menu title
    console.log(chalk.bold.cyan(`\n${title}`));
    this.theme.frameLine();

    // Display options with the new format - letter in brackets
    options.forEach((option) => {
      const colorFn = chalk[option.color as keyof typeof chalk] || chalk.white;
      console.log(
        `${option.icon || '•'} ${colorFn(`[ ${option.key.toUpperCase()} ]`)}  ${option.label}`,
      );
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
    let selection: string | undefined;
    const validKeys = options.map((opt) => opt.key.toLowerCase());

    while (!validKeys.includes(selection?.toLowerCase() || '')) {
      selection = await this.utils.question(chalk.yellow('→ Your choice: '));

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

      if (!validKeys.includes(selection?.toLowerCase() || '')) {
        console.log(chalk.red('⚠ Invalid selection. Please try again.'));
      }
    }

    // Find and return the selected option (case insensitive matching)
    const selectedOption = options.find(
      (opt) => opt.key.toLowerCase() === selection?.toLowerCase(),
    );
    if (selectedOption) {
      console.log(chalk.green(`✓ Selected: ${selectedOption.label}\n`));
      return selectedOption.key.toLowerCase();
    }

    // Should never reach here, but just in case
    return options[0].key.toLowerCase();
  }

  /**
   * Show Main Menu
   * 
   * Display main menu options
   * 
   * @returns Selected main menu option
   */
  async showMainMenu(): Promise<string> {
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
      'main menu',
    );
  }

  /**
   * Show Special Commands Help
   * 
   * Display special commands help
   */
  showSpecialCommandsHelp(): void {
    console.log(chalk.cyan('📝 Special commands you can use at any prompt:'));
    console.log(chalk.cyan('• Type "exit" or "quit" to exit the application'));
    console.log(
      chalk.cyan(
        '• Type "skip" to use the default selection for the current step',
      ),
    );
    console.log(
      chalk.cyan('• Both uppercase and lowercase input are accepted\n'),
    );
  }

  /**
   * Show Configuration Summary
   * 
   * Display configuration summary of environment, platform, and action
   * 
   * @param environment Selected environment
   * @param platform Selected platform
   * @param action Selected action
   * @returns Environment name in long form
   */
  showConfigSummary(
    environment: string,
    platform: string,
    action: string
  ): string {
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
      }`,
    );
    console.log(
      `📱 ${chalk.bold('Platform')}: ${
        platform === 'i'
          ? chalk.blue('iOS')
          : platform === 'a'
            ? chalk.green('Android')
            : chalk.cyan('Web')
      }`,
    );

    // Display action with appropriate label
    let actionLabel: string, actionColor: string;
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

    console.log(
      `🔧 ${chalk.bold('Action')}: ${chalk[actionColor as keyof typeof chalk](actionLabel)}`,
    );
    console.log(chalk.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    return envName;
  }

  /**
   * Display Command Line Usage
   * 
   * Show help information about command-line arguments
   */
  displayCommandLineUsage(): void {
    console.log(chalk.bold.blue('\n📋 COMMAND LINE ARGUMENTS USAGE 📋'));
    console.log(
      chalk.gray(
        'You can use the following arguments to skip interactive prompts:',
      ),
    );

    console.log(chalk.bold.cyan('\n1. Main Operations:'));
    console.log(
      chalk.gray('--version             Execute version update only'),
    );
    console.log(chalk.gray('--env                 Switch environment only'));
    console.log(
      chalk.gray(
        '--dev                 Go directly to development with current environment',
      ),
    );
    console.log(
      chalk.gray(
        '--start-server        Start React Native server only (--fresh for reset cache)',
      ),
    );
    console.log(
      chalk.gray(
        '--env-dev             Switch environment and go to development',
      ),
    );
    console.log(
      chalk.gray(
        '--version-env-dev     Complete flow: version, switch environment, and development',
      ),
    );

    console.log(chalk.bold.cyan('\n2. Environment Selection:'));
    console.log(
      chalk.gray('--development, --dev  Use development environment'),
    );
    console.log(chalk.gray('--staging, --stag     Use staging environment'));
    console.log(chalk.gray('--production, --prod  Use production environment'));

    console.log(chalk.bold.cyan('\n3. Platform Selection:'));
    console.log(chalk.gray('--ios                 Select iOS platform'));
    console.log(chalk.gray('--android             Select Android platform'));
    console.log(chalk.gray('--web                 Select Web platform'));

    console.log(chalk.bold.cyan('\n4. Action Selection:'));
    console.log(chalk.gray('--debug               Debug mode'));
    console.log(chalk.gray('--release             Release mode'));
    console.log(chalk.gray('--build               Build mode'));
    console.log(chalk.gray('--deploy              Deploy mode (Web only)'));

    console.log(chalk.bold.cyan('\n5. Other Options:'));
    console.log(
      chalk.gray('--fresh               Reset cache (with --start-server)'),
    );
    console.log(
      chalk.gray('--verbose             Show detailed output and logs'),
    );
    console.log(chalk.gray('--help                Display this help message'));

    console.log(chalk.bold.blue('\nEXAMPLES:'));
    console.log(
      chalk.gray(
        'node scripts/control-panel.js --version                         # Just update app version',
      ),
    );
    console.log(
      chalk.gray(
        'node scripts/control-panel.js --env --staging                   # Switch to staging environment',
      ),
    );
    console.log(
      chalk.gray(
        'node scripts/control-panel.js --start-server --fresh            # Start server with cache reset',
      ),
    );
    console.log(
      chalk.gray(
        'node scripts/control-panel.js --dev --ios --debug               # Debug iOS with current environment',
      ),
    );
    console.log(
      chalk.gray(
        'node scripts/control-panel.js --env-dev --prod --android --release  # Switch to production and run Android release',
      ),
    );
    console.log(
      chalk.gray(
        'node scripts/control-panel.js --dev --ios --debug --verbose     # Debug iOS with detailed log output',
      ),
    );

    console.log('');
  }
} 