#!/bin/bash

echo "----------------------------------"
git status
echo "----------------------------------"

read -p "Do you want to commit and push these changes? (y/n): " answer

if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
    git add .
    git commit -m "Auto commit"
    git push origin main
    echo "✅ Changes pushed to GitHub."
else
    echo "❌ Push cancelled."
fi
