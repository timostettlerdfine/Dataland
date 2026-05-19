---
name: ui-review-browser
description: "Open Dataland in browser, inspect a specific tab for UI inconsistencies, and generate user stories for improvements. Use when: visual QA is needed, checking newly implemented features, finding design/accessibility issues."
argument-hint: "Optional: specific tab name (e.g., 'frameworks', 'datasets')"
---

# UI Review & Browser Inspection

Visually inspect Dataland pages in a live browser, identify UI inconsistencies, and produce actionable user stories.

## Workflow

### Step 1 — Open Browser

Open the local Dataland instance:
```
https://local-dev.dataland.com/
```

This requires the stack to be running and healthy (check: `curl -s https://local-dev.dataland.com/api/actuator/health | grep status`).

### Step 2 — Ask User Which Tab

Display available tabs/pages:
- **Frameworks** — Schema tree, data point details, framework list
- **Data Model** — Framework specifications and documentation
- **Datasets** — Company data submission interface
- **Dashboard** — Home/overview
- **Quality Assurance** — QA tools
- **Company Requests** — Data request management
- Other tabs visible in navigation

**Prompt:** "Which tab would you like me to review for UI inconsistencies? Or specify a URL path."

### Step 3 — Navigate & Inspect

Once user selects, navigate to that tab and visually inspect for:

**Visual Inconsistencies:**
- Spacing/padding misalignment
- Font sizes inconsistent with design system
- Colors not matching theme (especially orange for Dataland primary)
- Icons misaligned or wrong style (should be PrimeIcons, not Material icons)
- Border radius/shadows not matching design tokens
- Button states unclear (hover, disabled, active)
- List/table row heights inconsistent

**Layout Issues:**
- Content overflow on smaller screens
- Responsiveness breaks at certain widths
- Header/sidebar navigation unclear
- Overflow text not truncated or wrapped properly

**Accessibility Issues:**
- Interactive elements without focus indicators
- Insufficient color contrast
- Missing labels on form inputs
- No keyboard navigation visible

**Information Architecture:**
- Labels unclear or ambiguous
- Call-to-action buttons not prominent
- Empty states not handled gracefully
- Loading states missing

**Comparison with other tabs:**
- Inconsistencies in design patterns across different pages (e.g., one page uses proper spacing and another doesn't)

### Step 4 — Take Screenshots

Capture the current state of the tab/page using the browser screenshot tool.

### Step 5 — Document Findings

Create a **user story** per issue found, formatted as:

```markdown
## User Story: [Issue Title]

**As a** [user role]
**I want** [desired behavior]
**So that** [benefit]

### Acceptance Criteria
- [ ] [specific observable outcome]
- [ ] [specific observable outcome]

### Visual Reference
[Description of what's currently wrong + location]

### Affected Components
- [Component name]
- [Component name]

### Priority
[High/Medium/Low]
```

### Step 6 — Present to User

Show all screenshots and user stories. Ask for prioritization.

## Common Inconsistencies in Dataland

| Issue | Location | Solution |
|-------|----------|----------|
| Material icons instead of PrimeIcons | Info buttons, actions | Replace with `<i class="pi pi-*"></i>` |
| Scoped styles override Design Tokens | Component styles | Use PrimeVue theme variables instead |
| Orange color not applied to interactive elements | Links, highlights | Apply `--p-orange-400` or `--p-orange-500` |
| Inconsistent spacing between sections | Everywhere | Use `var(--spacing-*)` CSS variables |
| Focus indicators not visible | Forms, buttons | Add `:focus` styles with contrasting color |

## Tools & Commands

**Check stack health before starting:**
```bash
curl -s https://local-dev.dataland.com/api/actuator/health | jq '.status'
```

**If "UP" is not shown:** Wait or restart stack with:
```bash
cd /dataland/main && ./manageLocalStack.sh --stop --start --simple
```

## Output

User stories go to a new markdown file (timestamped) at:
```
.github/artifacts/ui-review-{timestamp}.md
```

Or append to an existing review file if user specifies.
