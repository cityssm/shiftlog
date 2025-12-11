export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
/**
 * Sends an email using the configured SMTP settings
 */
export declare function sendEmail(options: SendEmailOptions): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Verifies the email configuration and connection
 */
export declare function verifyEmailConnection(): Promise<boolean>;
