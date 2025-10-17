# Security Policy

## Supported Versions

We currently provide security updates for the following packages and components:

- `gado` Solana program: active development branch (`main`)
- `frontend` (Vite + React app)
- `gado/frontend` (Vite + React app)

## Reporting a Vulnerability

If you discover a security vulnerability, please email security reports to security@gadowallet.example with the following details:

- Affected component (Solana program or specific frontend)
- Vulnerability description and potential impact
- Steps to reproduce (PoC)
- Any relevant logs, transaction IDs, or environment details

We will acknowledge your report within 72 hours and aim to provide an initial assessment within 7 days. Please do not disclose the issue publicly until we have released a fix or mitigation.

## Disclosure Policy

- We follow responsible disclosure. Do not perform actions that could disrupt real users or compromise data.
- Please avoid on-chain exploits on mainnet. Use Devnet when possible for PoCs.
- We may request additional details and will coordinate a disclosure timeline.

## Security Best Practices Implemented

- Content Security Policy (CSP) enforced in development and production
- `rel="noopener noreferrer"` on external links opened with `target="_blank"`
- Strict TypeScript settings to reduce runtime risks
- No use of `eval`, `Function` constructors, or unsafe HTML injection
- Rust program builds with overflow checks in release and limited panic surface
- Git ignored build artifacts and local test ledgers

## Scope Exclusions

- Third-party wallets and browser extensions are out of scope
- Smart contract risk from user-provided programs is out of scope

## PGP

For sensitive communications, request our PGP key via the security email.