import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let periodicCheckInterval: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Branch Notifier is now active!');

    let disposable = vscode.commands.registerCommand('branch-notifier.checkBranch', () => {
        checkCurrentBranch();
    });

    context.subscriptions.push(disposable);

    checkCurrentBranch();

    startPeriodicChecking();

    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('BranchNotifier.enabled') || 
            event.affectsConfiguration('BranchNotifier.checkInterval')) {
            startPeriodicChecking();
        }
    });
}

async function checkCurrentBranch(): Promise<void> {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }

        try {
            await execAsync('git rev-parse --git-dir', { cwd: workspaceFolder.uri.fsPath });
        } catch (error) {
            return;
        }

        const { stdout: branchName } = await execAsync('git branch --show-current', { 
            cwd: workspaceFolder.uri.fsPath 
        });
        
        const currentBranch = branchName.trim();

        if (currentBranch !== 'main' && currentBranch !== 'master') {
            vscode.window.showWarningMessage(
                `You are currently on branch "${currentBranch}" instead of main/master. Consider switching to the main branch.`,
                'Switch to Main',
                'Dismiss'
            ).then(selection => {
                if (selection === 'Switch to Main') {
                    switchToMainBranch(workspaceFolder.uri.fsPath);
                }
            });
        }
    } catch (error) {
        console.error('Error checking current branch:', error);
    }
}

async function switchToMainBranch(workspacePath: string): Promise<void> {
    try {

        try {
            await execAsync('git checkout main', { cwd: workspacePath });
            vscode.window.showInformationMessage('Successfully switched to main branch!');
        } catch (error) {
            try {
                await execAsync('git checkout master', { cwd: workspacePath });
                vscode.window.showInformationMessage('Successfully switched to master branch!');
            } catch (masterError) {
                vscode.window.showErrorMessage('Could not switch to main or master branch. Please switch manually.');
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage('Error switching branches: ' + error);
    }
}

function startPeriodicChecking(): void {
    if (periodicCheckInterval) {
        clearInterval(periodicCheckInterval);
        periodicCheckInterval = undefined;
    }

    const config = vscode.workspace.getConfiguration('BranchNotifier');
    const enabled = config.get<boolean>('enabled', false);
    const interval = config.get<string>('checkInterval', '1min');

    if (!enabled) {
        return;
    }

    let intervalMs: number;
    switch (interval) {
        case '30sec':
            intervalMs = 30 * 1000;
            break;
        case '1min':
            intervalMs = 60 * 1000;
            break;
        case '5min':
            intervalMs = 5 * 60 * 1000;
            break;
        default:
            intervalMs = 60 * 1000; // Default to 1 minute
    }

    periodicCheckInterval = setInterval(() => {
        checkCurrentBranch();
    }, intervalMs);

    console.log(`Periodic branch checking enabled with interval: ${interval}`);
}

export function deactivate() {
    if (periodicCheckInterval) {
        clearInterval(periodicCheckInterval);
        periodicCheckInterval = undefined;
    }
}