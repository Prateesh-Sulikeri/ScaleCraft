#!/bin/bash
set -e

# Check if the current branch is eligible for deployment
# Eligible branches: main, develop, release/*

BRANCH="${VERCEL_GIT_COMMIT_REF:-$(git rev-parse --abbrev-ref HEAD)}"

if [[ "$BRANCH" == "main" || "$BRANCH" == "develop" || "$BRANCH" == release/* ]]; then
  echo "✅ Deploying branch: $BRANCH"
  exit 0
fi

echo "🛑 Skipping deployment for branch: $BRANCH"
exit 1
