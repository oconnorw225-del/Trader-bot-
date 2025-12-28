# GitHub Copilot Configuration

This directory contains configuration files for GitHub Copilot to provide better code suggestions and assistance when working on the NDAX Quantum Engine.

## Files

### `copilot-instructions.md` (Legacy)

**Note:** This file is deprecated and disabled (applies_to: []). All active instructions are in the `instructions/` directory.

### `instructions/coding-standards.instructions.md`

This file contains comprehensive instructions for GitHub Copilot coding agent to understand:

- **Project Structure** - How the codebase is organized
- **Coding Standards** - JavaScript/React and Python conventions we follow
- **Security Requirements** - Critical security practices (encryption, no hardcoded secrets)
- **Module Guidelines** - Specific rules for quantum trading, freelance automation, AI orchestration
- **Testing Standards** - Jest configuration and coverage requirements
- **Git Workflow** - Branching strategy and commit conventions

### Scope

The instructions are automatically scoped to **all files** (`**/*`), which includes:
- `src/**/*` - Main application source code
- `tests/**/*` - Test suites
- `backend/**/*` - Node.js and Python backend services
- `scripts/**/*` - Automation and deployment scripts
- `.github/workflows/**/*` - CI/CD workflow files
- `*.js`, `*.jsx`, `*.py`, `*.sh`, `*.md`, `*.yml` - All project files

This ensures Copilot provides relevant suggestions when working anywhere in the repository.

## Using Copilot in This Project

When you use GitHub Copilot in this repository, it will:

1. **Follow Security Best Practices** - Never suggest hardcoded API keys or secrets
2. **Maintain Code Quality** - Suggest code that follows our ESLint rules and React patterns
3. **Include Error Handling** - Always wrap async operations in try/catch blocks
4. **Use ES Modules** - Suggest `import`/`export` syntax (not CommonJS)
5. **Apply Encryption** - Suggest using our encryption utilities for sensitive data
6. **Follow Testing Patterns** - Generate tests compatible with our Jest + ES Modules setup

## Examples

### Copilot-Assisted Code Generation

When you start typing a new React component, Copilot will suggest:

```jsx
import React, { useState, useEffect } from 'react';

export const NewComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  return (
    <div className="new-component">
      {/* Component content */}
    </div>
  );
};
```

### Copilot-Assisted API Calls

When writing API integration code, Copilot will suggest proper error handling:

```javascript
try {
  const response = await axios.post('/api/endpoint', data);
  return { success: true, data: response.data };
} catch (error) {
  logger.error('API call failed:', error);
  return { success: false, error: error.message };
}
```

## Updating Instructions

When making significant changes to project architecture or standards:

1. Update `instructions/coding-standards.instructions.md` with new guidelines
2. Include specific examples of good vs. bad code
3. Document any new patterns or conventions
4. Update the `applies_to` scope if working with new file patterns
5. Test by asking Copilot for suggestions in affected areas

### Structure

The instructions follow GitHub's recommended format:

```markdown
---
name: Instruction-Name
description: Brief description
applies_to:
  - "pattern/**/*"
  - "*.extension"
---

# Content here...
```

## Custom Agents

GitHub Copilot supports custom agents for specialized tasks. To create a custom agent:

1. Create a new file in `.github/agents/` with the name `<agent-name>.agent.md`
2. Use the following format:

```markdown
---
name: your-agent-name
description: What your agent does
---

# Agent Instructions

Detailed instructions for what this agent should do...
```

3. Merge the file into the default branch to make it available
4. Test locally using the [Copilot CLI](https://gh.io/customagents/cli)

**Note:** This repository currently does not have any custom agents defined. Custom agents should be created only when there's a clear need for specialized, reusable automation tasks.

For more information, see:
- [Custom Agents Configuration](https://gh.io/customagents/config)
- [Agent Skills in VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills)

## Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Best Practices for Copilot Coding Agent](https://gh.io/copilot-coding-agent-tips)
- [Copilot Coding Agent Tutorial](https://docs.github.com/en/copilot/tutorials/coding-agent)
- [Custom Agents Configuration](https://gh.io/customagents/config)
- [Project README](../README.md)
- [API Documentation](../docs/API.md)

## Working with Copilot Coding Agent

The GitHub Copilot coding agent can be assigned to issues to automatically implement changes. Here are best practices:

### Assigning Tasks to Copilot

1. **Create clear, well-scoped issues** with specific acceptance criteria
2. **Specify file paths** and which parts of the codebase to modify
3. **Assign to @copilot** on GitHub or via VS Code Agent Task panel
4. **Break complex tasks** into smaller, focused issues

### Issue Format Best Practices

```markdown
## Description
Clear description of what needs to be changed

## Acceptance Criteria
- [ ] Specific requirement 1
- [ ] Specific requirement 2
- [ ] All tests pass
- [ ] Code follows project standards

## Files to Modify
- `src/components/Dashboard.jsx` - Update chart display
- `src/shared/analytics.js` - Add new metric calculation

## Related Documentation
- See [Analytics Guide](docs/ANALYTICS.md) for context
```

### Reviewing Agent PRs

When Copilot creates a pull request:

1. **Review thoroughly** - Agent changes always require human approval
2. **Provide feedback** via PR comments - @copilot can revise based on your feedback
3. **Run tests and linting** before merging
4. **Check for security issues** especially in sensitive areas
5. **Verify no secrets** were accidentally committed

### Safety and Security

- ✅ All agent work happens in isolated sandboxes
- ✅ Changes require human review before merging
- ✅ Branch protections and status checks still apply
- ✅ Audit logs track all agent activity
- ✅ You can iterate with the agent via PR comments
