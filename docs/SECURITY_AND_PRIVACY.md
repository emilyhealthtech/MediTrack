# Security & Privacy Specification

## Privacy Framework (NDPA 2023)
MediTrack is engineered with privacy-by-design principles aligned with the Nigerian Data Protection Act 2023:
1. **Data Minimization:** Only demographic and administrative details necessary for appointment scheduling are captured.
2. **Explicit Consent:** Contact forms and patient registration require explicit consent checkboxes.
3. **Draft Legal Disclaimer:** All legal pages are explicitly marked as draft content pending qualified legal review in Nigeria.
4. **Sensitive Data Redaction:** Passwords, tokens, blood groups, and genotypes are automatically redacted from Pino logs.
5. **Multi-Tenant Isolation:** All data models are partitioned by `organizationId`.
