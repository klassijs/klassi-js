#!/usr/bin/env bash
set -eo pipefail

# Runs framework-owned s3 report dispatch for every project in projectList.csv.
# Usage:
#   ./runtime/scripts/run-s3-report-all-projects.sh [projects_dir]
#
# Default projects_dir assumes this script runs from klassi root in CircleCI,
# where checked-out projects are at ../projects.

PROJECTS_DIR="${1:-../projects}"
CSV_FILE="./runtime/scripts/projectList.csv"
KLASSI_ROOT="$(pwd)"

if [ ! -f "$CSV_FILE" ]; then
  echo "❌ Could not find project list at $CSV_FILE"
  exit 1
fi

if [ ! -d "$PROJECTS_DIR" ]; then
  echo "❌ Could not find projects directory at $PROJECTS_DIR"
  exit 1
fi

exitCode=0

trim() {
  local s="$1"
  # trim leading whitespace
  s="${s#"${s%%[![:space:]]*}"}"
  # trim trailing whitespace
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

exec < "$CSV_FILE"
read -r header

while IFS=',' read -r name branch folder; do
  name="$(trim "$name")"
  folder="$(trim "$folder")"

  [ -z "$name" ] && continue

  echo "####################################################"
  echo "#  The $name Project s3 Report"
  echo "####################################################"

  if [ -n "$folder" ]; then
    (
      node "$KLASSI_ROOT/runtime/scripts/run-s3-report-for-project.js" \
        "$PROJECTS_DIR/$name/$folder"
    ) || exitCode=1
  else
    (
      node "$KLASSI_ROOT/runtime/scripts/run-s3-report-for-project.js" \
        "$PROJECTS_DIR/$name"
    ) || exitCode=1
  fi
done

exit "$exitCode"
