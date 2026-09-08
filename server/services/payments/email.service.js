import { Resend } from 'resend'

import { env } from '../../config/env.js'


const resend =
  env.resendApiKey
    ? new Resend(
        env.resendApiKey,
      )
    : null


// =========================================================
// PASSWORD RESET EMAIL
// =========================================================

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


// =========================================================
// ORDER CONFIRMATION / PAYMENT RECEIPT EMAIL
// =========================================================

export async function sendOrderConfirmationEmail({
  to,
  order,
  razorpayPaymentId,
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

  if (
    typeof to !== 'string' ||
    to.trim() === ''
  ) {
    throw new Error(
      'Order confirmation email address is required.',
    )
  }

  if (!order) {
    throw new Error(
      'Order is required for confirmation email.',
    )
  }


  const customer =
    order.customer ?? {}


  const items =
    Array.isArray(order.items)
      ? order.items
      : []


  const orderId =
    typeof order._id?.toString === 'function'
      ? order._id.toString()
      : String(order.id ?? '')


  const totalAmount =
    Number(order.totalAmount)


  const formattedTotal =
    Number.isFinite(totalAmount)
      ? totalAmount.toFixed(2)
      : '0.00'


  const createdAt =
    order.createdAt
      ? new Date(
          order.createdAt,
        ).toLocaleString(
          'en-IN',
          {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
          },
        )
      : ''


  const itemRows =
    items
      .map(
        (item) => {
          const itemTotal =
            Number(item.itemTotal)

          const formattedItemTotal =
            Number.isFinite(itemTotal)
              ? itemTotal.toFixed(2)
              : '0.00'


          return `
            <tr>
              <td
                style="
                  padding: 14px 10px;
                  border-bottom: 1px solid #e6eeee;
                  color: #243b53;
                "
              >
                ${item.name ?? 'Marketplace website'}
              </td>

              <td
                style="
                  padding: 14px 10px;
                  border-bottom: 1px solid #e6eeee;
                  text-align: center;
                  color: #627d98;
                "
              >
                ${item.quantity ?? 1}
              </td>

              <td
                style="
                  padding: 14px 10px;
                  border-bottom: 1px solid #e6eeee;
                  text-align: right;
                  color: #243b53;
                  font-weight: 700;
                "
              >
                ₹${formattedItemTotal}
              </td>
            </tr>
          `
        },
      )
      .join('')


  const { data, error } =
    await resend.emails.send({
      from: env.mailFrom,

      to: [to.trim()],

      subject:
        `Marketplace Order Confirmation — #${orderId}`,

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 680px;
            margin: 0 auto;
            padding: 32px 20px;
            background: #f7fbfb;
            color: #243b53;
          "
        >

          <div
            style="
              background: #ffffff;
              border: 1px solid #dceaea;
              border-radius: 16px;
              overflow: hidden;
            "
          >

            <div
              style="
                padding: 28px 30px;
                background: #008f8f;
                color: #ffffff;
              "
            >

              <h1
                style="
                  margin: 0 0 8px;
                  font-size: 25px;
                "
              >
                Payment Successful
              </h1>

              <p
                style="
                  margin: 0;
                  font-size: 15px;
                  opacity: 0.95;
                "
              >
                Thank you for your purchase
                from Marketplace.
              </p>

            </div>


            <div
              style="
                padding: 30px;
              "
            >

              <p
                style="
                  margin-top: 0;
                  color: #627d98;
                  line-height: 1.6;
                "
              >
                Hi ${
                  customer.fullName ||
                  'there'
                },
              </p>

              <p
                style="
                  color: #627d98;
                  line-height: 1.6;
                "
              >
                Your payment has been
                successfully verified and
                your order has been confirmed.
              </p>


              <div
                style="
                  margin: 24px 0;
                  padding: 18px;
                  border-radius: 10px;
                  background: #f2f9f9;
                  border: 1px solid #d5e8e8;
                "
              >

                <div
                  style="
                    margin-bottom: 8px;
                    font-size: 13px;
                    color: #829ab1;
                  "
                >
                  ORDER ID
                </div>

                <div
                  style="
                    font-size: 16px;
                    font-weight: 700;
                    color: #102a43;
                    word-break: break-all;
                  "
                >
                  #${orderId}
                </div>

              </div>


              <table
                style="
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 24px;
                "
              >

                <thead>

                  <tr>

                    <th
                      style="
                        padding: 12px 10px;
                        border-bottom: 2px solid #dceaea;
                        text-align: left;
                        color: #486581;
                        font-size: 13px;
                      "
                    >
                      WEBSITE
                    </th>

                    <th
                      style="
                        padding: 12px 10px;
                        border-bottom: 2px solid #dceaea;
                        text-align: center;
                        color: #486581;
                        font-size: 13px;
                      "
                    >
                      QTY
                    </th>

                    <th
                      style="
                        padding: 12px 10px;
                        border-bottom: 2px solid #dceaea;
                        text-align: right;
                        color: #486581;
                        font-size: 13px;
                      "
                    >
                      AMOUNT
                    </th>

                  </tr>

                </thead>

                <tbody>
                  ${itemRows}
                </tbody>

              </table>


              <div
                style="
                  margin-top: 20px;
                  padding-top: 18px;
                  border-top: 2px solid #dceaea;
                  text-align: right;
                "
              >

                <span
                  style="
                    color: #627d98;
                    font-size: 14px;
                  "
                >
                  Total Paid
                </span>

                <div
                  style="
                    margin-top: 5px;
                    color: #008f8f;
                    font-size: 24px;
                    font-weight: 700;
                  "
                >
                  ₹${formattedTotal}
                </div>

              </div>


              <div
                style="
                  margin-top: 28px;
                  padding: 18px;
                  border-radius: 10px;
                  background: #f8fafb;
                  border: 1px solid #e5eeee;
                "
              >

                <div
                  style="
                    margin-bottom: 10px;
                    color: #102a43;
                    font-weight: 700;
                  "
                >
                  Payment Details
                </div>

                <div
                  style="
                    margin: 6px 0;
                    color: #627d98;
                    font-size: 14px;
                  "
                >
                  <strong>Status:</strong>
                  PAID
                </div>

                <div
                  style="
                    margin: 6px 0;
                    color: #627d98;
                    font-size: 14px;
                    word-break: break-all;
                  "
                >
                  <strong>Razorpay Payment ID:</strong>
                  ${
                    razorpayPaymentId ||
                    'Not available'
                  }
                </div>

                ${
                  createdAt
                    ? `
                      <div
                        style="
                          margin: 6px 0;
                          color: #627d98;
                          font-size: 14px;
                        "
                      >
                        <strong>Order Date:</strong>
                        ${createdAt}
                      </div>
                    `
                    : ''
                }

              </div>


              <p
                style="
                  margin-top: 28px;
                  color: #829ab1;
                  font-size: 13px;
                  line-height: 1.6;
                "
              >
                Please keep this email for your
                records. Your purchased website
                delivery is available through your
                Marketplace account.
              </p>

            </div>


            <div
              style="
                padding: 20px 30px;
                border-top: 1px solid #e6eeee;
                color: #829ab1;
                font-size: 12px;
                line-height: 1.6;
              "
            >
              This is an automated payment
              confirmation from Marketplace.
              Please do not reply directly to
              this email.
            </div>

          </div>

        </div>
      `,
    })


  if (error) {
    console.error(
      'Resend order confirmation email error:',
      error,
    )

    throw new Error(
      error.message ||
        'Failed to send order confirmation email.',
    )
  }


  console.log(
    'Order confirmation email sent:',
    data?.id,
  )


  return data
}