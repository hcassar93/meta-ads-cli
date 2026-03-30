---
name: meta-ads-cli-compliance-skill
description: Compliance and safety controls for agents operating Meta Ads CLI.
version: 1.0.0
tools:
  - meta-ads-cli
  - hcassar-meta-ads
---

# Compliance Skill: Meta Ads CLI

Compliance rules for agent usage of `meta-ads-cli`.

## Scope

Applies to:

- `meta-ads-cli`
- equivalent local dev invocations via `npm run dev --`

## 1) Sensitive data policy

Sensitive fields include:

- Meta app secret
- access tokens
- token expiry metadata tied to identities
- local config file contents

Required behavior:

- redact secrets in all logs/output
- never commit config/secrets to repository
- avoid sharing full raw API error payloads containing sensitive details

## 2) Identity and account boundary controls

Meta Ads data is account-scoped and sensitive.

Agent must:

1. Confirm active/intended profile before commands.
2. Use explicit `--profile` in multi-client contexts.
3. Use explicit `--account-id` where ambiguity exists.
4. Prevent cross-account data mixing in generated artifacts.

## 3) Authentication compliance

- Use official OAuth flow (`auth`) only.
- Keep callback local (`localhost`) and trusted.
- Re-auth on invalid/expired tokens; no insecure token hacks.
- Logout only when requested or necessary for security handling.

## 4) Command risk classification

Low risk (read-only):

- `accounts`, `account`, `campaigns`, `campaign`, `adsets`, `config`, `profiles --list`

Medium risk (context change):

- `profiles --switch`

Credential-state changing:

- `setup`, `auth`, `logout`

No campaign mutation commands are present in this CLI surface; maintain read-focused usage.

## 5) Pre-execution validation checklist

Before data commands:

1. Validate authentication status.
2. Validate profile and account context.
3. Validate IDs (`act_...`, campaign IDs) for intended target.
4. Prefer bounded limits for large reads.

## 6) Logging and audit requirements

Log:

- sanitized command
- profile/account context
- success/failure
- result counts and key IDs

Do not log:

- app secret
- access token
- credential file contents

## 7) Error handling compliance

- Surface errors honestly and clearly.
- Do not report success on failures.
- On permission/rate-limit/token issues, stop and return actionable remediation.
- Avoid uncontrolled retries against failing endpoints.

## 8) API and quota governance

- Respect Meta Marketing API rate constraints.
- Use limits to reduce unnecessary request volume.
- Avoid repeated high-frequency polling loops.

## 9) Compliance-safe command examples

```bash
meta-ads-cli config --profile client-a
meta-ads-cli accounts --profile client-a --json
meta-ads-cli campaigns --profile client-a --account-id act_123456789 --limit 25 --json
meta-ads-cli campaign 120213377777777 --profile client-a --insights --json
```

## 10) Prohibited behaviors

- exposing app secrets/tokens in chat or logs
- querying data for wrong account/profile
- running ambiguous account commands without context checks
- fabricating metrics or completion states
