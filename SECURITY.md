# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| Latest on `main` | Yes |
| Older tagged releases | Best effort |

## Reporting a Vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.

Report vulnerabilities privately by email to **markyu0615@gmail.com** with:

- a description of the issue and impact
- reproduction steps or proof of concept
- any suggested remediation if available

You should receive an acknowledgement within 72 hours for valid reports.

## Scope

This repository is the Next.js portfolio for m4rkyu.com. The most relevant
areas are:

- accidental exposure of personal or contact information
- secret leakage through deployment or environment configuration
- unsafe rendering of user-facing content or externally sourced assets
- routing or middleware mistakes that expose unfinished work as production

## Out of Scope

- social engineering or harassment not tied to a software vulnerability
- third-party provider issues entirely inside Vercel or other external services

## Disclosure Guidance

Please allow time for investigation and remediation before public disclosure.
Confirmed fixes should be reflected in release notes and the changelog when
appropriate.
