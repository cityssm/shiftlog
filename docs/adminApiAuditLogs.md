[Home](https://cityssm.github.io/shiftlog/)
•
[Help](https://cityssm.github.io/shiftlog/docs/)
•
[Administrator Tools](./admin.md)

# API Audit Logs

The API Audit Logs feature provides comprehensive tracking and monitoring of all
API endpoint access in ShiftLog. This security feature helps administrators monitor
API usage, detect unauthorized access attempts, and troubleshoot API integration issues.

## Overview

Every API request is automatically logged with detailed information including:

- **Request Time** - Date and time of the API request
- **User Name** - Username associated with the API key (if valid)
- **Endpoint** - The API endpoint that was accessed
- **Request Method** - HTTP method used (GET, POST, etc.)
- **Valid Key** - Whether the API key was valid
- **IP Address** - IP address of the requesting client
- **Response Status** - HTTP response status code (if available)

## Viewing Audit Logs

To access the API Audit Logs:

1. Navigate to **Administrator Tools** in the navigation menu
2. Select **API Audit Logs** from the administration section
3. The logs are displayed in a table format, sorted by most recent first

## Filtering Logs

The audit log viewer provides several filtering options:

### Filter by User Name

Enter a username in the **User Name** filter field to view only requests made with
that user's API key. This is helpful for:

- Tracking a specific user's API activity
- Investigating issues with a particular integration
- Auditing individual API key usage

### Filter by API Key Status

Use the **API Key Status** dropdown to filter logs by validity:

- **All** - Show all requests (both valid and invalid)
- **Valid** - Show only requests with valid API keys
- **Invalid** - Show only requests with invalid or missing API keys

Invalid API key attempts can help identify:

- Misconfigured integrations
- Unauthorized access attempts
- Expired or rotated API keys that need updating

### Refreshing the View

Click the **Refresh** button to reload the audit logs with the current filter settings.
The view automatically loads the most recent 100 entries.

## Understanding the Log Display

### Valid Key Indicator

- ✓ (Green checkmark) - The API key was valid
- ✗ (Red X) - The API key was invalid or missing

### Response Status Badge

Response status codes are color-coded for quick identification:

- **Green badge** - Success (status code < 400)
- **Red badge** - Error (status code ≥ 400)

Common status codes:

- `200` - Success
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (valid key, access denied)
- `404` - Not found

## Security and Privacy

### Data Retention

API audit logs are retained in the database indefinitely by default. Administrators
should establish a retention policy and periodically archive or delete old logs to
manage database size.

### Sensitive Information

The audit logs capture:

- **API keys** - Partial API keys are logged (be cautious when viewing logs)
- **IP addresses** - Client IP addresses are recorded
- **Endpoints** - Full endpoint paths including query parameters

Access to audit logs should be restricted to administrators only.

## Use Cases

### Security Monitoring

- Detect unusual patterns in API usage
- Identify unauthorized access attempts
- Monitor for brute force attacks
- Track API key compromise

### Troubleshooting

- Debug API integration issues
- Identify why certain requests are failing
- Verify API endpoint accessibility
- Check request timing and frequency

### Compliance

- Demonstrate access controls
- Provide audit trails for security reviews
- Document API usage for compliance requirements
- Track data access for privacy regulations

## Best Practices

1. **Regular Reviews** - Review audit logs regularly for suspicious activity
2. **Alert on Failures** - Monitor for patterns of invalid API key attempts
3. **Rotate Keys** - Periodically rotate API keys and verify logs show expected usage
4. **Archive Old Logs** - Establish a retention policy and archive old logs
5. **Investigate Anomalies** - Follow up on unexpected patterns or access attempts

## API Endpoints Logged

All API endpoints are automatically logged, including:

- Report exports (`/:apiKey/reports/:reportKey`)
- Work order calendar feeds (`/:apiKey/workOrders/:workOrderId.ics`)
- Work order digest (`/:apiKey/workOrderDigest`)

## Related Documentation

- [API Documentation](https://cityssm.github.io/shiftlog/docs/api.md) (if available)
- [User Management](./adminUsers.md) - Managing user API keys
- [Application Settings](./adminSettings.md) - Configuring API features
