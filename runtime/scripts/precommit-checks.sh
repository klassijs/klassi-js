#!/usr/bin/env bash
set -eo pipefail

#############################################
# Resolve ESLint JavaScript entrypoint
# Works with PNPM, workspaces, CI, local
#############################################
resolve_eslint() {
  local eslint_shim
  eslint_shim="$(pnpm which eslint 2>/dev/null || true)"

  if [ -z "$eslint_shim" ]; then
    echo "❌ Could not resolve eslint via pnpm" >&2
    return 1
  fi

  local eslint_js
  eslint_js="$(dirname "$eslint_shim")/../eslint/bin/eslint.js"
  eslint_js="$(realpath "$eslint_js")"

  if [ ! -f "$eslint_js" ]; then
    echo "❌ ESLint JS entrypoint not found: $eslint_js" >&2
    return 1
  fi

  echo "$eslint_js"
}


#############################################
# Resolve ESLint config (project root first, then KLASSI-JS runtime)
#############################################
resolve_eslint_config() {
  # Prefer project root eslint.config.js (e.g. one that extends KLASSI-JS runtime config)
  if [ -f "eslint.config.js" ]; then
    echo "eslint.config.js"
    return 0
  fi

  local klassijs_config="node_modules/klassi-js/runtime/coding-standards/eslint/eslint.config.js"
  local internal_config="runtime/coding-standards/eslint/eslint.config.js"

  if [ -f "$klassijs_config" ]; then
    echo "$klassijs_config"
    return 0
  fi

  if [ -f "$internal_config" ]; then
    echo "$internal_config"
    return 0
  fi

  echo "❌ Could not locate ESLint config in project or KLASSI-JS" >&2
  return 1
}



#############################################
# CI MODE
#############################################
if [ -n "$CI" ] || [ -n "$CIRCLECI" ]; then
  echo "🏁 Running lint checks in CI mode..."

  echo "🔎 Resolving ESLint binary..."
  ESLINT_BIN="$(resolve_eslint || true)"

  echo "🔎 Resolving ESLint config..."
  ESLINT_CONFIG="$(resolve_eslint_config || true)"

  LINT_EXIT=0

  if [ -n "$ESLINT_BIN" ] && [ -f "$ESLINT_BIN" ] &&
     [ -n "$ESLINT_CONFIG" ] && [ -f "$ESLINT_CONFIG" ]; then

    echo "▶ Running ESLint on all JS files..."
    if node "$ESLINT_BIN" \
      --quiet \
      --fix \
      --config "$ESLINT_CONFIG" \
      "**/*.js" \
      --ignore-pattern "node_modules/**" \
      --ignore-pattern "coverage/**" \
      --ignore-pattern "__tests__/**" \
      --ignore-pattern "**/utils/**"; then
      ESLINT_EXIT_CODE=0
    else
      ESLINT_EXIT_CODE=$?
    fi

    if [ $ESLINT_EXIT_CODE -eq 0 ]; then
      echo "✓ ESLint check passed"
    else
      echo "✗ ESLint found issues (exit code: $ESLINT_EXIT_CODE)"
      LINT_EXIT=1
    fi
  else
    echo "❌ ESLint could not be executed. Check installation."
    LINT_EXIT=1
  fi

  echo "▶ Running Gherkin lint..."
  # pnpm lint:gherkin
  pnpm gherkin
  GHERKIN_EXIT_CODE=$?

  if [ $GHERKIN_EXIT_CODE -eq 0 ]; then
    echo "✓ Gherkin lint passed"
  else
    echo "✗ Gherkin lint found issues (exit code: $GHERKIN_EXIT_CODE)"
    LINT_EXIT=1
  fi

  echo "🏁 CI lint exit code: $LINT_EXIT"
  exit $LINT_EXIT

#############################################
# LOCAL MODE
#############################################
else
  echo "💻 Local mode detected — running staged-file lint..."
  pnpm lint
  exit $?
fi
