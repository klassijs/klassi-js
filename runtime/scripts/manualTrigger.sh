# !/bin/bash

# Load .env if exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check required env vars
if [ -z "$CIRCLECI_API_TOKEN" ] || [ -z "$CIRCLECI_ORG" ] || [ -z "$CIRCLECI_REPO" ]; then
  echo "❌ Missing required environment variables. Please set CIRCLECI__TOKEN, CIRCLECI_ORG, and CIRCLECI_REPO in .env or export them."
  exit 1
fi

# Detect current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# CircleCI API endpoint
API_URL="$CIRCLECI_BASE_URL/project/gh/$CIRCLECI_ORG/$CIRCLECI_REPO/pipeline"
echo "🚀 Triggering manual workflow on api url: $API_URL"

# Trigger the pipeline
echo "🚀 Triggered manual workflow on branch: $CURRENT_BRANCH"
RESPONSE=$(curl -s -X POST \
  -H "Circle-Token: $CIRCLECI_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"branch\":\"$CURRENT_BRANCH\",\"parameters\":{\"manual_trigger\":true,\"run_integration_test\":false}}" \
  $API_URL)

# Show response
echo "✅ Response from CircleCI:"
echo "$RESPONSE"
