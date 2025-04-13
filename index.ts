/**
 * Project Control Panel
 *
 * This is the main entry point for the project control panel.
 * It provides an interactive CLI for managing the project environment,
 * including platform selection, target environment, and execution mode.
 *
 * @example
 * // Run the script interactively
 * ts-node scripts/control-panel/index.ts
 *
 * // Run with command line arguments
 * ts-node scripts/control-panel/index.ts --staging --ios --debug
 *
 * // Run version update only
 * ts-node scripts/control-panel/index.ts --version
 */

import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import readline from 'readline';

// Importar tudo do barrel file
import {
  ControlPanelConfig,
  createAndroidHandler,
  createiOSHandler,
  createEnvironmentManager,
  UIController,
  Utils,
  createVersionManager,
  createWebHandler,
  createReactNativeHandler,
} from './barrels';

/**
 * ControlPanel
 *
 * Main class for the control panel functionality
 */
class ControlPanel {
  private config: ControlPanelConfig;
  private rl: readline.Interface;
  private android: ReturnType<typeof createAndroidHandler>;
  private ios: ReturnType<typeof createiOSHandler>;
  private environment: ReturnType<typeof createEnvironmentManager>;
  private ui: UIController;
  private utils: Utils;
  private version: ReturnType<typeof createVersionManager>;
  private web: ReturnType<typeof createWebHandler>;
  private reactNative: ReturnType<typeof createReactNativeHandler>;

  /**
   * Constructor
   *
   * Initializes the control panel and its modules
   */
  constructor() {
    // Create readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Make readline interface globally available
    (global as any).rl = this.rl;

    // Load configuration
    this.config = this.loadConfig();

    // Initialize modules
    this.utils = new Utils(this.config);
    this.ui = new UIController(this.config, this.utils);
    this.environment = createEnvironmentManager(this.config, this.utils);
    this.android = createAndroidHandler(this.config, this.utils);
    this.ios = createiOSHandler(this.config, this.utils);
    this.web = createWebHandler(this.config, this.utils);
    this.reactNative = createReactNativeHandler(this.config, this.utils);
    this.version = createVersionManager(this.config, this.utils);
  }

  /**
   * Load Configuration
   *
   * Loads the control panel configuration from the JSON file
   *
   * @returns Control panel configuration
   */
  private loadConfig(): ControlPanelConfig {
    try {
      const configPath = path.resolve(process.cwd(), 'control-panel-data.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error(
        chalk.red(`Failed to load configuration: ${(error as Error).message}`),
      );
      console.log(chalk.yellow('Using default configuration...'));

      // Return a minimal default configuration
      return {
        environment: {
          development: {
            enabled: true,
            'original-env-location': path.resolve(
              process.cwd(),
              'environment',
              '.env.development',
            ),
          },
          staging: {
            enabled: true,
            'original-env-location': path.resolve(
              process.cwd(),
              'environment',
              '.env.staging',
            ),
          },
          production: {
            enabled: true,
            'original-env-location': path.resolve(
              process.cwd(),
              'environment',
              '.env.production',
            ),
          },
        },
        android: {
          enabled: true,
          scripts: {},
        },
        ios: {
          enabled: true,
          scripts: {},
        },
        web: {
          enabled: true,
          scripts: {},
        },
        version: {
          enabled: true,
          platforms: {
            ios: {
              project_file: path.resolve(
                process.cwd(),
                'ios',
                'member.xcodeproj',
                'project.pbxproj',
              ),
              bundle_id: {
                production: 'com.walrus.member',
                staging: 'com.walrus.member-staging',
              },
            },
            android: {
              build_gradle: path.resolve(
                process.cwd(),
                'android',
                'app',
                'build.gradle',
              ),
            },
          },
        },
        ui: {
          title_banner: ' 📊 PROJECT CONTROL PANEL 📊 ',
          status_enabled: '✓',
          status_disabled: '✗',
          colors: {
            development: 'green',
            staging: 'yellow',
            production: 'red',
            ios: 'blue',
            android: 'green',
            web: 'cyan',
          },
        },
      };
    }
  }

  /**
   * Initialize
   *
   * Initializes the control panel
   */
  public async initialize(): Promise<void> {
    // Initialize verbosity settings
    this.utils.verbosity.init();

    // Check for help argument
    if (process.argv.includes('--help')) {
      await this.displayCommandLineUsage();
      this.rl.close();
      return;
    }

    // Check for main operation arguments
    const args = process.argv.slice(2);
    const mainArgs = {
      version: args.includes('--version'),
      env: args.includes('--env'),
      dev: args.includes('--dev'),
      startServer: args.includes('--start-server'),
      envDev: args.includes('--env-dev'),
      versionEnvDev: args.includes('--version-env-dev'),
    };

    // If any main operation args are provided, run in non-interactive mode
    if (
      mainArgs.version ||
      mainArgs.env ||
      mainArgs.dev ||
      mainArgs.startServer ||
      mainArgs.envDev ||
      mainArgs.versionEnvDev
    ) {
      console.log(chalk.bold('Running with command line arguments...'));

      // Process main operations based on command-line args
      if (mainArgs.versionEnvDev) {
        await this.handleVersionUpdate();
        await this.handleEnvironmentSwitch();
        await this.handleDevelopment();
      } else if (mainArgs.envDev) {
        await this.handleEnvironmentSwitch();
        await this.handleDevelopment();
      } else if (mainArgs.version) {
        await this.handleVersionUpdate();
      } else if (mainArgs.env) {
        await this.handleEnvironmentSwitch();
      } else if (mainArgs.startServer) {
        await this.handleStartServer();
      } else if (mainArgs.dev) {
        await this.handleDevelopment();
      }

      this.rl.close();
      return;
    }

    // Interactive mode flow
    // Display project dashboard
    this.ui.displayDashboard();

    // Show special commands help
    this.ui.showSpecialCommandsHelp();

    // Display main menu and handle option
    await this.handleMainMenu();

    // Close readline interface
    if ((global as any).rl) {
      this.rl.close();
    }
  }

  /**
   * Display Command Line Usage
   *
   * Displays help for command line arguments
   */
  private async displayCommandLineUsage(): Promise<void> {
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
        'ts-node scripts/control-panel/index.ts --version                         # Just update app version',
      ),
    );
    console.log(
      chalk.gray(
        'ts-node scripts/control-panel/index.ts --env --staging                   # Switch to staging environment',
      ),
    );
    console.log(
      chalk.gray(
        'ts-node scripts/control-panel/index.ts --start-server --fresh            # Start server with cache reset',
      ),
    );
    console.log(
      chalk.gray(
        'ts-node scripts/control-panel/index.ts --dev --ios --debug               # Debug iOS with current environment',
      ),
    );
    console.log(
      chalk.gray(
        'ts-node scripts/control-panel/index.ts --env-dev --prod --android --release  # Switch to production and run Android release',
      ),
    );
    console.log(
      chalk.gray(
        'ts-node scripts/control-panel/index.ts --dev --ios --debug --verbose     # Debug iOS with detailed log output',
      ),
    );

    console.log('');
  }

  /**
   * Handle Main Menu
   *
   * Handle main menu selection
   */
  private async handleMainMenu(): Promise<void> {
    // Show main menu
    const mainChoice = await this.ui.showMainMenu();

    switch (mainChoice) {
      case 'v': // Just version the app
        await this.handleVersionUpdate();
        break;
      case 'e': // Just switch environment
        await this.handleEnvironmentSwitch();
        break;
      case 's': // Start React Native server
        await this.handleStartServer();
        break;
      case 'd': // Proceed to development with current environment
        await this.handleDevelopment();
        break;
      case 'w': // Switch environment and proceed to development
        await this.handleEnvironmentSwitch();
        await this.handleDevelopment();
        break;
      case 'a': // Version, switch environment, and proceed to development
        await this.handleVersionUpdate();
        await this.handleEnvironmentSwitch();
        await this.handleDevelopment();
        break;
      case 'x': // Exit
        console.log(chalk.gray('Exiting application...'));
        return;
    }
  }

  /**
   * Handle Version Update
   *
   * Handle version update flow
   */
  private async handleVersionUpdate(): Promise<void> {
    // Prompt for version update
    const { version, versionCode } = await this.version.promptVersionUpdate();

    // Read current environment
    const envStatus = this.environment.getCurrentEnvironment();
    const environment = envStatus.type || 'development';

    // Update version
    this.version.updateVersion(version, versionCode, environment);
  }

  /**
   * Handle Environment Switch
   *
   * Handle environment switch flow
   */
  private async handleEnvironmentSwitch(): Promise<void> {
    // Check the current environment
    const currentEnvStatus = this.environment.getCurrentEnvironment();
    const currentEnv = currentEnvStatus.type || 'none';

    console.log(chalk.cyan(`Current environment: ${chalk.bold(currentEnv)}`));

    // Environment selection
    const environment = await this.ui.showMenu(
      'Select New Environment:',
      this.ui.getEnvironmentOptions(),
      'environment',
    );

    // Convert short code to name
    const envName =
      environment === 'd'
        ? 'development'
        : environment === 's'
          ? 'staging'
          : 'production';

    // Check if the new environment is different from current
    if (currentEnv === envName) {
      console.log(
        chalk.blue(
          `🔄 Refreshing the ${chalk.bold(envName)} environment to ensure file integrity...`,
        ),
      );
    }

    // Generate .env file based on selected environment
    const envGenerated = await this.environment.generateEnvFile(envName);

    if (envGenerated) {
      if (currentEnv === envName) {
        console.log(
          chalk.green(
            `✅ Successfully refreshed the ${chalk.bold(envName)} environment file!`,
          ),
        );
      } else {
        console.log(
          chalk.green(
            `✅ Successfully switched from ${chalk.bold(currentEnv)} to ${chalk.bold(envName)} environment!`,
          ),
        );
      }
    } else {
      console.log(
        chalk.red(`❌ Failed to set up ${chalk.bold(envName)} environment.`),
      );
      const tryAgain = await this.utils.confirm('Do you want to try again?');
      if (tryAgain) {
        await this.handleEnvironmentSwitch();
      }
    }
  }

  /**
   * Handle Start Server
   *
   * Handle starting the React Native server
   */
  private async handleStartServer(): Promise<void> {
    this.ui.theme.sectionHeader('React Native Server');

    // Display server options
    const serverOptions = [
      { key: 'S', label: 'Standard start', color: 'green' },
      { key: 'F', label: 'Fresh start (reset cache)', color: 'yellow' },
      { key: 'C', label: 'Clean all caches', color: 'red' },
      { key: 'T', label: 'Stop server', color: 'blue' },
      { key: 'E', label: 'Exit', color: 'gray' },
    ];

    const serverChoice = await this.ui.showMenu(
      'Select Server Option:',
      serverOptions,
      'server start',
    );

    if (serverChoice === 'e') {
      console.log(chalk.gray('Returning to main menu...'));
      return;
    }

    switch (serverChoice) {
      case 's':
        await this.reactNative.startServer('standard');
        break;
      case 'f':
        await this.reactNative.startServer('fresh');
        break;
      case 'c':
        await this.reactNative.cleanCache();
        break;
      case 't':
        await this.reactNative.stopServer();
        break;
    }
  }

  /**
   * Handle Development
   *
   * Handle development flow
   */
  private async handleDevelopment(): Promise<void> {
    // Platform selection
    this.ui.theme.sectionHeader('Platform Selection');

    const platformOptions = [
      { key: 'I', label: 'iOS', color: 'blue' },
      { key: 'A', label: 'Android', color: 'green' },
      { key: 'W', label: 'Web', color: 'cyan' },
      { key: 'E', label: 'Exit', color: 'gray' },
    ];

    const platformChoice = await this.ui.showMenu(
      'Select Platform:',
      platformOptions,
      'platform',
    );

    if (platformChoice === 'e') {
      console.log(chalk.gray('Returning to main menu...'));
      return;
    }

    // Action selection
    this.ui.theme.sectionHeader('Action Selection');

    const actionOptions = [
      { key: 'D', label: 'Debug', color: 'green' },
      { key: 'R', label: 'Release', color: 'yellow' },
      { key: 'B', label: 'Build', color: 'blue' },
    ];

    // Add Deploy option for Web only
    if (platformChoice === 'w') {
      actionOptions.push({ key: 'P', label: 'Deploy', color: 'magenta' });
    }

    actionOptions.push({ key: 'E', label: 'Exit', color: 'gray' });

    const actionChoice = await this.ui.showMenu(
      'Select Action:',
      actionOptions,
      'action',
      platformChoice,
    );

    if (actionChoice === 'e') {
      console.log(chalk.gray('Returning to platform selection...'));
      return await this.handleDevelopment();
    }

    // Get current environment
    const currentEnvStatus = this.environment.getCurrentEnvironment();
    const envName = currentEnvStatus.type || 'development';
    console.log(chalk.cyan(`\nUsing environment: ${chalk.bold(envName)}`));

    // Execute platform-specific actions
    switch (platformChoice) {
      case 'i': // iOS
        await this.executeIOSAction(actionChoice, envName);
        break;
      case 'a': // Android
        await this.executeAndroidAction(actionChoice, envName);
        break;
      case 'w': // Web
        await this.executeWebAction(actionChoice, envName);
        break;
    }
  }

  /**
   * Execute iOS Action
   *
   * Execute the selected action for iOS platform
   *
   * @param action - The selected action
   * @param environment - The current environment
   */
  private async executeIOSAction(
    action: string,
    environment: string,
  ): Promise<void> {
    // Setup the environment first
    await this.ios.setupEnvironment(environment);

    const target = 'member'; // This could be retrieved from config if needed

    switch (action) {
      case 'd': // Debug
        await this.ios.executeDebug(environment, target);
        break;
      case 'r': // Release
        const devices = await this.ios.listDevices();
        const selectedDevice = await this.ios.selectDevice(devices);
        if (selectedDevice) {
          await this.ios.executeRelease(
            environment,
            target,
            'Release',
            selectedDevice,
          );
        } else {
          console.log(
            chalk.red('No device selected. Cannot proceed with release.'),
          );
        }
        break;
      case 'b': // Build
        await this.ios.executeBuild(environment, target, 'Release');
        break;
    }
  }

  /**
   * Execute Android Action
   *
   * Execute the selected action for Android platform
   *
   * @param action - The selected action
   * @param environment - The current environment
   */
  private async executeAndroidAction(
    action: string,
    environment: string,
  ): Promise<void> {
    // Setup the environment first
    await this.android.setupEnvironment(environment);

    // Get build variant
    const variant = this.android.getVariant(environment, action);

    // Select device
    const deviceId = await this.android.selectDevice();
    if (!deviceId && action !== 'b') {
      console.log(chalk.red('No device selected. Cannot proceed.'));
      return;
    }

    switch (action) {
      case 'd': // Debug
        await this.android.executeDebug(
          environment,
          variant,
          deviceId || 'emulator',
        );
        break;
      case 'r': // Release
        await this.android.executeRelease(
          environment,
          variant,
          deviceId || 'emulator',
        );
        break;
      case 'b': // Build
        await this.android.executeBuild(environment, variant);
        break;
    }
  }

  /**
   * Execute Web Action
   *
   * Execute the selected action for Web platform
   *
   * @param action - The selected action
   * @param environment - The current environment
   */
  private async executeWebAction(
    action: string,
    environment: string,
  ): Promise<void> {
    // Setup the environment first
    await this.web.setupEnvironment(environment);

    switch (action) {
      case 'd': // Debug
        await this.web.executeDebug(environment);
        break;
      case 'b': // Build
        await this.web.executeBuild(environment);
        break;
      case 'p': // Deploy
        await this.web.executeDeploy(environment);
        break;
    }
  }
}

/**
 * Main function to start the control panel
 */
async function main() {
  try {
    const controlPanel = new ControlPanel();
    await controlPanel.initialize();
  } catch (error) {
    console.error(
      chalk.red(`Error in control panel: ${(error as Error).message}`),
    );
    process.exit(1);
  }
}

// Run the main function
main();
