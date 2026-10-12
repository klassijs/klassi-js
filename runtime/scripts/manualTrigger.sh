#!/usr/bin/env bash

# Load .env if exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check required env vars
if [ -z "$CIRCLECI_API_TOKEN" ] || [ -z "$CIRCLECI_ORG" ] || [ -z "$CIRCLECI_REPO" ]; then
  echo "❌ Missing required environment variables. Please set CIRCLECI_API_TOKEN, CIRCLECI_ORG, and CIRCLECI_REPO in .env or export them."
  exit 1
fi

# Detect current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Trigger mode: release | s3 | both
MODE="${1:-release}"
# Optional explicit repo override as second arg
TARGET_REPO_OVERRIDE="${2:-}"
RUN_RELEASE=true
RUN_S3_REPORT=false
TARGET_REPO="$CIRCLECI_REPO"

case "$MODE" in
  release)
    RUN_RELEASE=true
    RUN_S3_REPORT=false
    TARGET_REPO="$CIRCLECI_REPO"
    ;;
  s3)
    RUN_RELEASE=false
    RUN_S3_REPORT=true
    TARGET_REPO="klassi-js"
    ;;
  both)
    # "both" means trigger release in the configured project and s3 report in klassi-js.
    RUN_RELEASE=true
    RUN_S3_REPORT=false
    TARGET_REPO="$CIRCLECI_REPO"
    ;;
  *)
    echo "❌ Invalid mode: $MODE"
    echo "Usage: ./runtime/scripts/manualTrigger.sh [release|s3|both] [optional-repo-override]"
    exit 1
    ;;
esac

if [ -n "$TARGET_REPO_OVERRIDE" ]; then
  TARGET_REPO="$TARGET_REPO_OVERRIDE"
fi

trigger_pipeline() {
  local repo="$1"
  local run_release="$2"
  local run_s3_report="$3"
  local api_url="$CIRCLECI_BASE_URL/project/gh/$CIRCLECI_ORG/$repo/pipeline"
  echo "🚀 Triggering mode on repo: $repo"
  echo "🚀 API URL: $api_url"
  curl -s -X POST \
    -H "Circle-Token: $CIRCLECI_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"branch\":\"$CURRENT_BRANCH\",\"parameters\":{\"run_release\":$run_release,\"run_s3_report\":$run_s3_report}}" \
    "$api_url"
}

if [ "$MODE" = "both" ] && [ -z "$TARGET_REPO_OVERRIDE" ]; then
  echo "🚀 Triggered manual workflow on branch: $CURRENT_BRANCH (mode: both)"
  echo "ℹ️  Trigger 1/2: release on $CIRCLECI_REPO"
  RESPONSE_RELEASE=$(trigger_pipeline "$CIRCLECI_REPO" true false)
  echo "✅ Release response:"
  echo "$RESPONSE_RELEASE"

  echo "ℹ️  Trigger 2/2: s3 report on klassi-js"
  RESPONSE_S3=$(trigger_pipeline "klassi-js" false true)
  echo "✅ S3 response:"
  echo "$RESPONSE_S3"
  exit 0
fi

echo "🚀 Triggered manual workflow on branch: $CURRENT_BRANCH (mode: $MODE, repo: $TARGET_REPO)"
RESPONSE=$(trigger_pipeline "$TARGET_REPO" "$RUN_RELEASE" "$RUN_S3_REPORT")

# Show response
echo "✅ Response from CircleCI:"
echo "$RESPONSE"
