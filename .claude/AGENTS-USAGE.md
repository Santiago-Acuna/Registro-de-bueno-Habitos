# Custom Agents Usage Guide

## Two Ways to Use Agents

### Option 1: Natural Delegation (No Context Isolation)
Use agents from `.claude/agents/` via natural language. Simple but shares your context.

### Option 2: CLI Flag (With Context Isolation) ✅ Recommended
Launch Claude with `--agents` flag for true isolated context windows.

```bash
# Windows PowerShell
.\.claude\launch-with-agents.ps1

# Linux/macOS/WSL
./.claude/launch-with-agents.sh

# Or directly with JSON file
claude --agents "$(cat .claude/agents.json)"
```

---

## Available Custom Agents

Your project has 12 custom agents configured in `.claude/agents/`:

### Development Workflow Agents

1. **git-workflow-manager** - Conventional commits and PR descriptions
   - Use when: Creating commits, PRs, or managing versioning
   - Example: "Use git-workflow-manager to commit these database changes"

2. **user-story-creator** - User story creation
   - Use when: Starting new features, defining requirements
   - Example: "Use user-story-creator to break down this feature"

3. **code-quality-auditor** - Senior code review
   - Use when: Need rigorous code review before merging
   - Example: "Use code-quality-auditor to review this implementation"

4. **security-auditor** - Security compliance review
   - Use when: Before merging to development branch
   - Example: "Use security-auditor to check for vulnerabilities"

### Backend Development Agents

5. **nodejs-programming-mentor** - Node.js learning and guidance
   - Use when: Need explanations or learning Node.js concepts
   - Example: "Ask nodejs-programming-mentor to explain async patterns"

6. **nodejs-tdd-test-first** - Write tests before implementation (RED phase)
   - Use when: Starting new backend functionality
   - Example: "Use nodejs-tdd-test-first to create tests for this endpoint"

7. **nodejs-test-implementer** - Implement code to pass tests (GREEN phase)
   - Use when: Tests are failing and need minimal implementation
   - Example: "Use nodejs-test-implementer to make these tests pass"

8. **postgresql-database-architect** - Database design and optimization
   - Use when: Schema design, query optimization, migrations
   - Example: "Use postgresql-database-architect to optimize this query"

### Frontend Development Agents

9. **react-programming-mentor** - React learning and guidance
   - Use when: Need explanations or learning React concepts
   - Example: "Ask react-programming-mentor to explain useEffect"

10. **react-tdd-test-first** - Write React tests first (RED phase)
    - Use when: Starting new frontend functionality
    - Example: "Use react-tdd-test-first to create tests for this component"

11. **react-test-implementer** - Implement React code to pass tests (GREEN phase)
    - Use when: React tests are failing and need implementation
    - Example: "Use react-test-implementer to make component tests pass"

12. **wcag-accessibility-auditor** - WCAG 2.1 AA compliance auditing
    - Use when: UI features are complete and need accessibility review
    - Example: "Use wcag-accessibility-auditor to audit this form"

## How to Use Agents

### Natural Delegation (Recommended)

Simply reference the agent by name in your request:

```
Use git-workflow-manager to commit the migration file
```

Claude Code will automatically detect and delegate to the appropriate agent.

### When Agents Activate

Agents activate based on their `description` field. Claude will:
1. Analyze your request
2. Match it against agent descriptions
3. Automatically delegate to the best-fit agent

## Important Notes

### Task Tool Limitation

Custom agents in `.claude/agents/` **cannot** be used with the Task tool's `subagent_type` parameter:

```
❌ Task(subagent_type="git-workflow-manager", ...)  # Won't work
✅ "Use git-workflow-manager to..."                 # Works!
```

The Task tool only supports built-in agents: Bash, general-purpose, Explore, Plan, claude-code-guide.

### Recommended Development Workflow

**Backend (from server/CLAUDE.md):**
1. user-story-creator → Define requirements
2. git-workflow-manager → Commit architecture
3. nodejs-tdd-test-first → Write failing tests
4. git-workflow-manager → Commit RED phase
5. nodejs-test-implementer → Implement to pass tests
6. git-workflow-manager → Commit GREEN phase
7. security-auditor → Security review before merge
8. git-workflow-manager → Commit security fixes

**Frontend:**
1. user-story-creator → Define requirements
2. git-workflow-manager → Commit architecture
3. react-tdd-test-first → Write failing tests
4. git-workflow-manager → Commit RED phase
5. react-test-implementer → Implement to pass tests
6. git-workflow-manager → Commit GREEN phase
7. wcag-accessibility-auditor → Accessibility review
8. git-workflow-manager → Commit accessibility fixes

## Configuration

Your agents are configured in:
- **Location**: `.claude/agents/*.md` (natural delegation)
- **Location**: `.claude/agents.json` (context isolation)
- **Settings**: `.claude/settings.local.json`

Agents are automatically discovered from:
- Project level: `.claude/agents/` (current)
- User level: `~/.claude/agents/` (optional)

---

## Context Isolation Explained

### Without Context Isolation (`.claude/agents/*.md`)
```
┌─────────────────────────────────────┐
│     Main Context Window             │
│  ┌───────────────────────────────┐  │
│  │ Agent prompt injected here   │  │
│  │ Shares all conversation      │  │
│  │ history and token budget     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```
- Agent sees full conversation history
- Shares token budget with main conversation
- No separate compaction
- Simpler but less efficient for large tasks

### With Context Isolation (`--agents` flag)
```
┌─────────────────────────────────────┐
│     Main Context Window             │
└─────────────────────────────────────┘
          │ Task delegation
          ▼
┌─────────────────────────────────────┐
│   Agent Context (Isolated)          │
│   - Own token budget                │
│   - Independent compaction          │
│   - Separate transcript             │
│   - Restricted tool access          │
└─────────────────────────────────────┘
```
- Agent has dedicated context window
- Own token budget (won't exhaust main conversation)
- Can run in background
- Better for large, focused tasks

### When to Use Each

| Scenario | Recommendation |
|----------|----------------|
| Quick questions | Natural delegation |
| Large code reviews | Context isolation |
| Multi-file analysis | Context isolation |
| Simple commits | Natural delegation |
| Complex refactoring | Context isolation |
| Security audits | Context isolation |

---

## Files Reference

```
.claude/
├── agents/                    # Natural delegation agents
│   ├── git-commit-specialist.md
│   ├── nodejs-programming-mentor.md
│   ├── nodejs-tdd-test-first.md
│   ├── nodejs-test-implementer.md
│   ├── postgresql-database-architect.md
│   ├── react-programming-mentor.md
│   ├── react-tdd-test-first.md
│   ├── react-test-implementer.md
│   ├── security-auditor.md
│   ├── senior-code-reviewer.md
│   ├── user-story-creator.md
│   └── wcag-accessibility-auditor.md
├── agents.json                # Context isolation agents (JSON)
├── launch-with-agents.ps1     # Windows launcher
├── launch-with-agents.sh      # Linux/macOS launcher
├── settings.local.json        # Local settings
└── AGENTS-USAGE.md            # This documentation
```
