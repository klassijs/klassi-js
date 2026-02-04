# #!/usr/bin/env sh

# Check if running in CI environment
if [ -n "$CI" ] || [ -n "$CIRCLECI" ]; then
  # In CI, check all files
  echo "Running lint checks in CI mode (checking all files)..."
  
  # Find eslint binary using node to resolve it from OAF's dependencies
  echo "Finding eslint binary..."
  ESLINT_BIN=$(node -e "try { const path = require('path'); const oafPath = require.resolve('OAF/package.json'); const eslintPkg = require.resolve('eslint/package.json', {paths: [path.dirname(oafPath)]}); console.log(eslintPkg.replace('/package.json', '/bin/eslint.js')); } catch(e) { process.exit(1); }" 2>/dev/null)
  
  LINT_EXIT=0

  # Run eslint on all JS files
  if [ -n "$ESLINT_BIN" ] && [ -f "$ESLINT_BIN" ]; then
    echo "Running eslint on all JS files..."
    node "$ESLINT_BIN" --quiet --fix --config node_modules/OAF/runtime/coding-standards/eslint/eslint.config.js '**/*.js' --ignore-pattern 'node_modules/**' --ignore-pattern 'coverage/**'
    ESLINT_EXIT_CODE=$?
    if [ $ESLINT_EXIT_CODE -eq 0 ]; then
      echo "✓ ESLint check passed"
    else
      echo "✗ ESLint found errors (exit code: $ESLINT_EXIT_CODE)"
      LINT_EXIT=1
    fi
  else
    echo "Error: Could not find eslint binary. Make sure OAF and its dependencies are installed."
    LINT_EXIT=1
  fi

  # Run gherkin lint on all feature files
  echo "Running gherkin lint on all feature files..."
  pnpm lint:gherkin
  GHERKIN_EXIT_CODE=$?
  if [ $GHERKIN_EXIT_CODE -eq 0 ]; then
    echo "✓ Gherkin lint check passed"
  else
    echo "✗ Gherkin lint found errors (exit code: $GHERKIN_EXIT_CODE)"
    LINT_EXIT=1
  fi

  exit $LINT_EXIT

else
  # In local environment, use lint-staged to check only staged files
  pnpm lint
fi
