# Claude Code Command: commit

## Command Description
This command automates the git commit workflow by viewing all changes, generating an appropriate commit message, committing the changes, and pushing to the remote repository.

## Usage
```
/commit [--push] [--no-push] [message]
```

### Parameters
- **--push** (default): Automatically push after committing
- **--no-push**: Only commit without pushing
- **message** (optional): Custom commit message (skips auto-generation)

### Examples
```
/commit
/commit --no-push
/commit "feat: add user authentication"
```

## Command Behavior

### Phase 1: Review Changes
1. **Check Git Status**: View all staged and unstaged changes
2. **View Diff**: Show detailed changes for review
3. **Review Recent Commits**: Check commit history for message style

### Phase 2: Generate Commit Message
1. **Analyze Changes**: Understand the nature of modifications
2. **Categorize Changes**: Identify if it's a feature, fix, refactor, docs, etc.
3. **Generate Message**: Create a concise, descriptive commit message following conventional commits format

### Phase 3: Commit and Push
1. **Stage Changes**: Add all modified and new files
2. **Create Commit**: Commit with the generated message
3. **Push to Remote**: Push changes to the remote repository (if --push)

## Commit Message Format

The command follows conventional commits specification:
```
<type>(<scope>): <subject>

<body>

> Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **refactor**: Code refactoring
- **docs**: Documentation changes
- **style**: Code style/formatting changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```
feat(quiz): add timer functionality with auto-submission
fix(admin): resolve question deletion issue in blob storage
refactor(api): improve error handling in quiz submission
docs(readme): update installation instructions
```

## Workflow

1. Run `git status` to see all changes
2. Run `git diff` to view detailed modifications
3. Analyze changes and generate appropriate commit message
4. Stage all changes with `git add .`
5. Commit with generated message
6. Push to remote repository (unless --no-push specified)
7. Confirm success and show final status

## Safety Features

- **Pre-commit Review**: Shows all changes before committing
- **Conflict Detection**: Checks for merge conflicts
- **Branch Awareness**: Warns when committing to main/master
- **Push Validation**: Verifies remote tracking before pushing
- **Error Recovery**: Provides guidance if commit or push fails

## Integration with Git Hooks

The command respects git hooks:
- **pre-commit**: Runs linting, formatting, tests
- **commit-msg**: Validates commit message format
- **pre-push**: Runs additional validation before pushing

If a hook fails, the command will report the error and provide guidance for fixing issues.
