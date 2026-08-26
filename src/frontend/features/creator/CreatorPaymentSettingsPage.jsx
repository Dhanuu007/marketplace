import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './CreatorPaymentSettingsPage.css'


export function CreatorPaymentSettingsPage() {
  const { token } = useAuth()


  const [formData, setFormData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  })


  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')


  useEffect(() => {
    async function loadPaymentProfile() {
      if (!token) {
        setIsLoading(false)
        setError('Authentication is required.')
        return
      }


      try {
        setIsLoading(true)
        setError('')


        const data = await apiRequest(
          '/creator/payment-profile',
          {
            method: 'GET',
            token,
          },
        )


        const paymentProfile =
          data?.paymentProfile


        if (paymentProfile) {
          setFormData({
            accountHolderName:
              paymentProfile.accountHolderName ||
              '',

            bankName:
              paymentProfile.bankName ||
              '',

            accountNumber:
              paymentProfile.accountNumber ||
              '',

            ifscCode:
              paymentProfile.ifscCode ||
              '',

            upiId:
              paymentProfile.upiId ||
              '',
          })
        }
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Unable to load your payment details.',
        )
      } finally {
        setIsLoading(false)
      }
    }


    loadPaymentProfile()
  }, [token])


  function handleChange(event) {
    const {
      name,
      value,
    } = event.target


    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))


    setError('')
    setSuccess('')
  }


  async function handleSubmit(event) {
    event.preventDefault()


    if (!token) {
      setError('Authentication is required.')
      return
    }


    setIsSaving(true)
    setError('')
    setSuccess('')


    try {
      const data = await apiRequest(
        '/creator/payment-profile',
        {
          method: 'PUT',
          token,
          body: formData,
        },
      )


      const paymentProfile =
        data?.paymentProfile


      if (paymentProfile) {
        setFormData({
          accountHolderName:
            paymentProfile.accountHolderName ||
            '',

          bankName:
            paymentProfile.bankName ||
            '',

          accountNumber:
            paymentProfile.accountNumber ||
            '',

          ifscCode:
            paymentProfile.ifscCode ||
            '',

          upiId:
            paymentProfile.upiId ||
            '',
        })
      }


      setSuccess(
        'Your payment details have been saved successfully.',
      )
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to save your payment details.',
      )
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <main className="creator-payment-page">

      <section className="creator-payment-container">

        <Link
          to="/creator/dashboard"
          className="creator-payment-back"
        >
          ← Back to Dashboard
        </Link>


        <header className="creator-payment-header">

          <p className="eyebrow">
            Creator Payments
          </p>

          <h1>
            Payment Settings
          </h1>

          <p>
            Manage the payment details that will be
            used when your Creator earnings are paid
            out.
          </p>

        </header>


        <section className="creator-payment-card">

          <div className="creator-payment-card-heading">

            <div>
              <span>
                Payout Details
              </span>

              <h2>
                Your payment information
              </h2>
            </div>

          </div>


          {isLoading && (
            <div className="creator-payment-message">
              <strong>
                Loading payment details...
              </strong>

              <span>
                Please wait while we load your
                saved payment information.
              </span>
            </div>
          )}


          {!isLoading && (
            <form
              className="creator-payment-form"
              onSubmit={handleSubmit}
            >

              <div className="creator-payment-form-grid">

                <div className="creator-payment-field">

                  <label htmlFor="accountHolderName">
                    Account Holder Name
                  </label>

                  <input
                    id="accountHolderName"
                    name="accountHolderName"
                    type="text"
                    value={
                      formData.accountHolderName
                    }
                    onChange={handleChange}
                    placeholder="Enter account holder name"
                    autoComplete="name"
                    required
                  />

                </div>


                <div className="creator-payment-field">

                  <label htmlFor="bankName">
                    Bank Name
                  </label>

                  <input
                    id="bankName"
                    name="bankName"
                    type="text"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                    autoComplete="organization"
                    required
                  />

                </div>


                <div className="creator-payment-field">

                  <label htmlFor="accountNumber">
                    Bank Account Number
                  </label>

                  <input
                    id="accountNumber"
                    name="accountNumber"
                    type="text"
                    inputMode="numeric"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="Enter bank account number"
                    autoComplete="off"
                    required
                  />

                </div>


                <div className="creator-payment-field">

                  <label htmlFor="ifscCode">
                    IFSC Code
                  </label>

                  <input
                    id="ifscCode"
                    name="ifscCode"
                    type="text"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    placeholder="Example: SBIN0001234"
                    autoComplete="off"
                    maxLength={11}
                    style={{
                      textTransform: 'uppercase',
                    }}
                    required
                  />

                </div>


                <div className="creator-payment-field creator-payment-field-full">

                  <label htmlFor="upiId">
                    UPI ID
                  </label>

                  <input
                    id="upiId"
                    name="upiId"
                    type="text"
                    value={formData.upiId}
                    onChange={handleChange}
                    placeholder="Example: creator@upi"
                    autoComplete="off"
                  />

                  <small>
                    UPI is optional if you are providing
                    bank account details.
                  </small>

                </div>

              </div>


              {error && (
                <div className="creator-payment-error">
                  {error}
                </div>
              )}


              {success && (
                <div className="creator-payment-success">
                  {success}
                </div>
              )}


              <div className="creator-payment-form-footer">

                <div>
                  <strong>
                    Payment information
                  </strong>

                  <span>
                    Keep your payout details accurate
                    so manual payouts can be processed
                    correctly.
                  </span>
                </div>


                <button
                  type="submit"
                  className="creator-payment-save-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? 'Saving...'
                    : 'Save Payment Details'}
                </button>

              </div>

            </form>
          )}

        </section>

      </section>

    </main>
  )
}


export default CreatorPaymentSettingsPage