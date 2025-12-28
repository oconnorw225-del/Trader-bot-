# GitHub Copilot Configuration

This directory contains configuration files for GitHub Copilot to provide better code suggestions and assistance when working on the NDAX Quantum Engine.

## Files

### `copilot-instructions.md` (Legacy)

**Note:** This file is deprecated. Instructions have been moved to `instructions/` directory.

### `instructions/coding-standards.instructions.md`

This file contains comprehensive instructions for GitHub Copilot coding agent to understand:

- **Project Structure** - How the codebase is organized
- **Coding Standards** - JavaScript/React and Python conventions we follow
- **Security Requirements** - Critical security practices (encryption, no hardcoded secrets)
- **Module Guidelines** - Specific rules for quantum trading, freelance automation, AI orchestration
- **Testing Standards** - Jest configuration and coverage requirements
- **Git Workflow** - Branching strategy and commit conventions

### Scope

The instructions are automatically scoped to:
- `src/**/*` - Main application source code
- `tests/**/*` - Test suites
- `backend/**/*` - Node.js and Python backend services
- `*.js`, `*.jsx`, `*.py` - All JavaScript and Python files

This ensures Copilot provides relevant suggestions when working in these directories and files.

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
4. Update the `applyTo` scope if working with new file patterns
5. Test by asking Copilot for suggestions in affected areas

### Structure

The instructions follow GitHub's recommended format:

```markdown
---
name: Instruction-Name
description: Brief description
applyTo:
  - "pattern/**/*"
  - "*.extension"
---

# Content here...
```

## Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Best Practices for Copilot Coding Agent](https://gh.io/copilot-coding-agent-tips)
- [Project README](../README.md)
- [API Documentation](../docs/API.md)
