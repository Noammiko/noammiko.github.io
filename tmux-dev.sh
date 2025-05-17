#!/bin/bash

# Script to set up a tmux development environment for noam_website project

SESSION_NAME="noam_website"

# Check if the session already exists
tmux has-session -t $SESSION_NAME 2>/dev/null

# $? is the exit status of the last command
if [ $? == 0 ]; then
    echo "Session $SESSION_NAME already exists. Attaching..."
    tmux attach -t $SESSION_NAME
    exit 0
fi

# Create a new session with the first window named "Editor"
tmux new-session -d -s $SESSION_NAME -n "Editor"

# For testing: Echo the command instead of running it
tmux send-keys -t "$SESSION_NAME:Editor" "cd src && nvim ." C-m

# Create a second window named "DevServers"
tmux new-window -t $SESSION_NAME -n "DevServers"

# Split the DevServers window vertically
tmux split-window -h -t "$SESSION_NAME:DevServers"

# Debug: Let's add a pause and print pane numbers to help diagnose
tmux send-keys -t "$SESSION_NAME:DevServers.1" "bun run dev:astro" C-m
tmux send-keys -t "$SESSION_NAME:DevServers.2" "bun run dev:convex" C-m

# Select the first window (Editor)
tmux select-window -t "$SESSION_NAME:Editor"

# Attach to the session
tmux attach -t $SESSION_NAME
