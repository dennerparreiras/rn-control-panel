# Contributing to @dennerparreiras/control-panel

Thank you for your interest in contributing to the Control Panel project! This document outlines the process for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/control-panel.git
   cd control-panel
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Building the Project

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Manual Testing

You can test your changes by linking the package locally:

```bash
npm link
control-panel
```

## Project Structure

The project is organized into modules, each with its own responsibilities:

- `/Android`: Android platform management
- `/iOS`: iOS platform management
- `/Web`: Web platform management
- `/Environment`: Environment management
- `/Version`: Version management
- `/ReactNative`: React Native server management
- `/UI`: User interface components
- `/Utils`: Utility functions

Each module follows a consistent structure:
- `index.ts`: Main module implementation
- `types.ts`: TypeScript type definitions

## Coding Standards

- Write clean, readable code with meaningful variable and function names
- Follow the existing coding style
- Use TypeScript for all new code
- Add JSDoc comments for all functions and classes
- Update tests to cover new functionality
- Ensure all linting checks pass before submitting

## Commit Message Guidelines

We follow conventional commits for our commit messages:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Test-related changes
- `chore`: Changes to the build process, tools, etc.

Example: `feat: add iOS device discovery`

## Pull Request Process

1. Ensure your code adheres to the coding standards
2. Update documentation if necessary
3. Add/update tests as needed
4. Make sure all tests pass
5. Submit your pull request to the `main` branch

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 