#!/bin/bash

# Script to deploy the compiler backend to Render.com

# Step 1: Commit changes
echo "Committing changes..."
git add compiler/backend/index.js compiler/backend/config.js
git commit -m "Fix CORS issues in compiler backend"

# Step 2: Push changes to GitHub
echo "Pushing changes to GitHub..."
git push

# Step 3: Trigger a manual deploy on Render.com
echo "Changes pushed to GitHub. Now go to Render.com dashboard and trigger a manual deploy."
echo "Visit: https://dashboard.render.com/web/srv-XXXXX/deploys"
echo "Replace XXXXX with your service ID"

echo "Deployment process completed!"
