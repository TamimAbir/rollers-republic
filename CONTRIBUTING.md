# Contributing to RollON

Thank you for your interest in contributing to RollON! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the bug
- Describe the behavior you observed and expected
- Include screenshots if applicable
- Specify your environment (OS, browser, Node version)

### Suggesting Enhancements

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Explain why this enhancement would be useful
- List similar features in other projects if applicable

### Pull Requests

1. Fork the repository and create your branch from `main`
2. Install dependencies: `cd rollon-app && npm install`
3. Make your changes
4. Run quality gates before submitting:
   ```bash
   npm run lint
   npm test -- --run
   npm run build
   ```
5. Ensure all tests pass and linting is clean
6. Update documentation if needed
7. Submit the pull request with a clear description

## Development Workflow

```bash
# Clone and setup
git clone https://github.com/FahadIbrahim93/RollON-MVP-Final-V1.git
cd RollON-MVP-Final-V1/rollon-app
npm install

# Start development
npm run dev

# Run tests
npm test -- --run

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Lint code
npm run lint
```

## Coding Standards

- Follow the existing code style (see `.editorconfig`)
- Use TypeScript for all new code
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- All UI changes must meet WCAG 2.1 AA accessibility standards
- Add `aria-label` to all icon-only buttons and links

## Commit Message Format

```
type(scope): description

fix(cart): resolve duplicate item issue on add
feat(shop): add product filtering by category
docs(readme): update installation instructions
chore(deps): update dependencies to latest versions
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.