# Branch Notifier

A VS Code extension that warns users when they're not on the main branch of their Git repository.

## Features

- **Automatic Detection**: Checks your current branch when VS Code starts
- **Periodic Checking**: Optionally check branches at regular intervals (30sec, 1min, 5min)
- **Warning Notifications**: Shows a warning message when you're not on main/master branch
- **Quick Switch**: Provides a button to quickly switch to the main branch
- **Manual Check**: Includes a command to manually check your current branch
- **Configurable**: Enable/disable periodic checking and choose your preferred interval

## How it works

1. When VS Code starts, the extension automatically checks if you're in a Git repository
2. If you're not on the `main` or `master` branch, it shows a warning notification
3. If periodic checking is enabled, it will continue to check at your chosen interval
4. You can click "Switch to Main" to automatically switch to the main branch

## Usage

1. Open a Git repository in VS Code
2. The extension will automatically check your branch on startup
3. If you're not on main/master, you'll see a warning notification

## Extension Settings

This extension contributes the following settings:

* `BranchNotifier.enabled`: Enable periodic branch checking (default: false)
* `BranchNotifier.checkInterval`: Interval for periodic checking - 30sec, 1min, or 5min (default: 1min)