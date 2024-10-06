Here is a detailed `COMMIT_GUIDELINES.md` to help maintain consistency and clarity in your commit messages. This guide includes appropriate Git emojis to use for various tasks and a commit message template specifically tailored for your project STAYCATION.

---

### COMMIT_GUIDELINES.md

---

# Commit Guidelines for CHEKAM

This document provides guidelines for making commits in the CHEKAM project. Following these conventions will help maintain a clear and meaningful commit history.

## Table of Contents
- [Commit Message Format](#commit-message-format)
- [Git Emojis](#git-emojis)
- [Example Commit Messages](#example-commit-messages)
- [Additional Tips](#additional-tips)

---

## Commit Message Format

Each commit message should conform to the following structure:

```plaintext
<git-emoji> <type>: <subject>

<body>
```

### Commit Message Parts

- **`<git-emoji>`**: The Git emoji that represents the type of change.
- **`<type>`**: The type of change being made.
- **`<subject>`**: A short summary of the change. Use imperative mood.
- **`<body>`**: (Optional) A more detailed description of the change.

## Git Emojis

Use the following Git emojis for their corresponding tasks:

| Emoji                      | Commit Type    | Description                                      |
|----------------------------|----------------|--------------------------------------------------|
| 🎉 `:tada:`                | Initial commit | Initial setup of the project.                    |
| ✨ `:sparkles:`             | Feature        | Introducing new features.                        |
| 🐛 `:bug:`                 | Bugfix         | Fixing a bug in the codebase.                    |
| 🔨 `:hammer:`              | Refactor       | Code refactoring without changing any feature.   |
| 📚 `:books:`               | Documentation  | Add or update documentation.                     |
| 🔥 `:fire:`                | Remove         | Removing code or files.                          |
| 👷 `:construction_worker:` | Build          | Adding CI build system or external dependencies. |
| ✅ `:white_check_mark:`     | Test           | Adding or updating tests.                        |
| ⬆️ `:arrow_up:`            | Upgrade        | Upgrading dependencies.                          |
| ⬇️ `:arrow_down:`          | Downgrade      | Downgrading dependencies.                        |
| 🔧 `:wrench:`              | Tooling        | Updating tools, configs, or build routines.      |
| 🚀 `:rocket:`              | Deploy         | Deploying stuff.                                 |
| 🎨 `:art:`                 | Style          | Improving structure or format of the code.       |

## Example Commit Messages

### Initial Commit
```plaintext
🎉 Initial commit: Set up the initial project structure

- Created the basic directory structure.
- Added initial README.md and .gitignore files.
```

### Feature Addition
```plaintext
✨ Feature: Add user registration functionality

- Implemented user registration API endpoint.
- Added input validation for registration fields.
- Included unit tests for user registration.
```

### Bug Fix
```plaintext
🐛 Bugfix: Fix issue with user login

- Corrected the password hashing mechanism.
- Updated validation logic in login endpoint.
```

### Documentation Update
```plaintext
📚 Documentation: Update README with setup instructions

- Added detailed steps for setting up the project locally.
- Included environment variable configurations.
```

### Refactor Code
```plaintext
🔨 Refactor: Improve database connection handling

- Separated database connection logic into a new module.
- Enhanced error handling for database connections.
```

### Style Improvement
```plaintext
🎨 Style: Format code according to PEP 8 standards

- Ran code through the PEP 8 formatter.
- Ensured proper indentation and spacing.
```

### Remove Code
```plaintext
🔥 Remove: Delete unused utility functions

- Removed deprecated utility functions from utils.py.
- Updated references in corresponding modules.
```

## Additional Tips

- **Break down your work** into small, logical commits. Avoid large, monolithic commits.
- **Write clear and concise commit messages**. The subject should be no longer than 50 characters, and the body, if necessary, should provide more details.
- **Give context** in your commit messages when necessary, especially if the change is not immediately obvious.
- **Use the imperative mood** in the subject line (e.g., "Add feature" not "Added feature").
- **Test your changes** before committing to ensure they work as expected.

By following these guidelines, you can ensure that your commit history is clean, meaningful, and easy to understand. Happy coding!