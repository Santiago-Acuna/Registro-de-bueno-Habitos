#!/bin/bash
# Launch Claude Code with custom agents that have context isolation
# Usage: ./.claude/launch-with-agents.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTS_FILE="$SCRIPT_DIR/agents.json"

if [ ! -f "$AGENTS_FILE" ]; then
    echo "Error: agents.json not found at $AGENTS_FILE"
    exit 1
fi

echo "Launching Claude Code with custom agents (context isolation enabled)..."
echo ""
echo "Available agents:"
jq -r 'keys[]' "$AGENTS_FILE" | while read agent; do
    echo "  - $agent"
done
echo ""

# Read agents from JSON file and pass to claude
AGENTS_JSON=$(cat "$AGENTS_FILE")
claude --agents "$AGENTS_JSON"
