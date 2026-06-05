# Security Policy

> **⚠️ Disclaimer — For Education Purpose Only**
>
> This project is provided strictly for educational and research purposes. The authors and contributors assume **no responsibility or liability** for any damages, losses, or risks arising from the use of this software. **We do not bear any responsibility or risk** for how this software is used.

---

**📬 Contact:** Mulky Malikul Dhaher | [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)

---

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 3.0.x   | ✅ |
| 2.2.x   | ✅ |
| 2.0.x   | ✅ |
| 1.0.x   | ✅ |
| < 1.0   | ❌ |

## Reporting a Vulnerability

We take the security of JSUPTER AI Gateway seriously. If you believe you have found a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

📧 **[mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)**

### What to Include

Please include the following information in your report:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** of the vulnerability
4. **Possible mitigations** (if you have suggestions)
5. **Your contact information** for follow-up

### Response Timeline

- **Acknowledgment**: Within 48 hours of receiving your report
- **Initial Assessment**: Within 5 business days
- **Status Updates**: At least every 7 days until resolution
- **Resolution**: Depends on complexity, but we aim for critical fixes within 14 days

### Responsible Disclosure Guidelines

- **Do not** exploit the vulnerability beyond what is necessary to demonstrate it
- **Do not** access, modify, or delete other users' data
- **Do not** degrade the performance or availability of the service
- **Do** provide sufficient detail to reproduce and fix the issue
- **Do** allow us reasonable time to fix the issue before public disclosure

### Scope

#### In Scope

- Authentication bypass or privilege escalation
- Remote code execution vulnerabilities
- SQL injection or NoSQL injection
- Cross-site scripting (XSS)
- Server-side request forgery (SSRF)
- Information disclosure vulnerabilities
- Denial of service (DoS) vulnerabilities
- API key or token exposure in source code
- Prompt injection vulnerabilities
- Provider API key leakage

#### Out of Scope

- Social engineering attacks
- Physical attacks
- Attacks requiring privileged network access
- Vulnerabilities in third-party dependencies (report to the dependency maintainer)
- Issues already reported

### Security Best Practices for Users

1. **Never expose your Puter token** in client-side code or public repositories
2. **Use HTTPS** in production deployments
3. **Enable rate limiting** to prevent abuse
4. **Monitor access logs** for suspicious activity
5. **Keep dependencies updated** with `npm audit`
6. **Use environment variables** for all sensitive configuration
7. **Restrict network access** to the gateway port (3333) using firewalls

### Recognition

We appreciate responsible disclosure and will acknowledge contributors who report valid security vulnerabilities in our release notes (unless they prefer to remain anonymous).

Thank you for helping keep JSUPTER AI Gateway and our users safe!

---

<div align="center">

**For Education Purpose Only — No Responsibility or Liability Assumed**

</div>
