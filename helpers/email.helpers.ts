import Debug from 'debug'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js'

import { DEBUG_NAMESPACE } from '../debug.config.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:email`)

let transporterInstance: Transporter<SMTPTransport.SentMessageInfo> | undefined

/**
 * Gets or creates the nodemailer transporter instance
 */
function getTransporter(): Transporter<SMTPTransport.SentMessageInfo> | undefined {
  const emailConfig = getConfigProperty('connectors.email')

  if (!emailConfig) {
    debug('Email configuration not found or incomplete')
    return undefined
  }

  if (transporterInstance === undefined) {
    debug('Creating nodemailer transporter')
    transporterInstance = nodemailer.createTransport(emailConfig)
  }

  return transporterInstance
}

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Sends an email using the configured SMTP settings
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter()

  if (!transporter) {
    const error = 'Email not configured'
    debug(error)
    return { success: false, error }
  }

  const emailConfig = getConfigProperty('email')
  
  try {
    const info = await transporter.sendMail({
      from: emailConfig?.from ?? 'noreply@example.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    })

    debug(`Email sent successfully: ${info.messageId}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    debug(`Error sending email: ${errorMessage}`)
    return { success: false, error: errorMessage }
  }
}

/**
 * Verifies the email configuration and connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
  const transporter = getTransporter()

  if (!transporter) {
    return false
  }

  try {
    await transporter.verify()
    debug('Email configuration verified successfully')
    return true
  } catch (error) {
    debug(`Email verification failed: ${error}`)
    return false
  }
}
