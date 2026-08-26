import { Resend } from 'resend'

import { env } from '../../config/env.js'


const resend =
  env.resendApiKey
    ? new Resend(
        env.resendApiKey,
      )
    : null


export async function sendPasswordResetEmail({
  to,
  resetUrl,
}) {
  if (!resend) {
    throw new Error(
      'Resend is not configured.',
    )
  }

  if (!env.mailFrom) {
    throw new Error(
      'MAIL_FROM is not configured.',
    )
  }

  const { data, error } =
    await resend.emails.send({
      from: env.mailFrom,

      to: [to],

      subject:
        'Reset your Marketplace password',

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 32px;
            color: #243b53;
          "
        >

          <h2
            style="
              color: #102a43;
              margin-bottom: 12px;
            "
          >
            Reset your password
          </h2>

          <p
            style="
              color: #627d98;
              line-height: 1.6;
            "
          >
            We received a request to reset
            your Marketplace account password.
          </p>

          <p
            style="
              color: #627d98;
              line-height: 1.6;
            "
          >
            Click the button below to create
            a new password.
          </p>

          <div style="margin: 28px 0;">

            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 20px;
                border-radius: 8px;
                background: #008f8f;
                color: #ffffff;
                text-decoration: none;
                font-weight: 700;
              "
            >
              Reset Password
            </a>

          </div>

          <p
            style="
              color: #829ab1;
              font-size: 13px;
              line-height: 1.6;
            "
          >
            This password reset link will
            expire in 30 minutes.
          </p>

          <p
            style="
              color: #829ab1;
              font-size: 13px;
              line-height: 1.6;
            "
          >
            If you did not request a password
            reset, you can safely ignore this email.
          </p>

        </div>
      `,
    })

  if (error) {
    console.error(
      'Resend email error:',
      error,
    )

    throw new Error(
      error.message ||
        'Failed to send password reset email.',
    )
  }

  console.log(
    'Password reset email sent:',
    data?.id,
  )

  return data
}