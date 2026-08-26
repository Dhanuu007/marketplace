import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../../../services/apiClient.js'

import './CreatorAutomatedPayoutsPage.css'


export function CreatorAutomatedPayoutsPage() {
  const auth = useAuth()


  const [isCompleted, setIsCompleted] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [error, setError] = useState('')

  const [currentStep, setCurrentStep] = useState(1)

  const [routeAccount, setRouteAccount] = useState(null)


  const [formData, setFormData] = useState({
    phone: '',
    payoutName: '',
    accountType: '',
    legalBusinessName: '',
    customerFacingBusinessName: '',
    businessType: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  })


  // =========================================================
  // LOAD EXISTING PAYOUT INFORMATION
  // =========================================================

  useEffect(() => {
    async function loadPayoutInformation() {
      if (!auth.token) {
        setIsLoading(false)
        setError('Authentication is required.')
        return
      }


      try {
        setIsLoading(true)
        setError('')


        const routeAccountData =
          await apiRequest(
            '/creator/route-account',
            {
              method: 'GET',
              token: auth.token,
            },
          )


        setRouteAccount(
          routeAccountData?.routeAccount ?? null,
        )


        const paymentProfileData =
          await apiRequest(
            '/creator/payment-profile',
            {
              method: 'GET',
              token: auth.token,
            },
          )


        const paymentProfile =
          paymentProfileData?.paymentProfile


        if (paymentProfile) {
          setFormData((currentData) => ({
            ...currentData,

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
          }))
        }
      } catch (requestError) {
        setError(
          requestError?.message ||
            'Unable to load your payout information.',
        )
      } finally {
        setIsLoading(false)
      }
    }


    loadPayoutInformation()
  }, [auth.token])


  // =========================================================
  // FORM HANDLING
  // =========================================================

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
  }


  // =========================================================
  // STEP 1 VALIDATION
  // =========================================================

  function validateStepOne() {
    if (
      formData.phone.trim() === ''
    ) {
      setError(
        'Please enter your mobile number.',
      )

      return false
    }


    if (
      formData.payoutName.trim() === ''
    ) {
      setError(
        'Please enter the name you want to use for payouts.',
      )

      return false
    }


    if (
      formData.accountType === ''
    ) {
      setError(
        'Please select whether you are an individual or a registered business.',
      )

      return false
    }


    return true
  }


  // =========================================================
  // STEP 2 VALIDATION
  // =========================================================

  function validateStepTwo() {
    if (
      formData.accountType ===
      'REGISTERED_BUSINESS'
    ) {
      if (
        formData.legalBusinessName.trim() === ''
      ) {
        setError(
          'Please enter your legal business name.',
        )

        return false
      }


      if (
        formData.customerFacingBusinessName.trim() === ''
      ) {
        setError(
          'Please enter your customer-facing business name.',
        )

        return false
      }


      if (
        formData.businessType === ''
      ) {
        setError(
          'Please select your business type.',
        )

        return false
      }
    }


    if (
      formData.accountHolderName.trim() === ''
    ) {
      setError(
        'Please enter the bank account holder name.',
      )

      return false
    }


    if (
      formData.bankName.trim() === ''
    ) {
      setError(
        'Please enter your bank name.',
      )

      return false
    }


    if (
      formData.accountNumber.trim() === ''
    ) {
      setError(
        'Please enter your bank account number.',
      )

      return false
    }


    if (
      !/^\d{9,18}$/.test(
        formData.accountNumber.trim(),
      )
    ) {
      setError(
        'Bank account number must contain 9 to 18 digits.',
      )

      return false
    }


    if (
      formData.ifscCode.trim() === ''
    ) {
      setError(
        'Please enter your IFSC code.',
      )

      return false
    }


    if (
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
        formData.ifscCode
          .trim()
          .toUpperCase(),
      )
    ) {
      setError(
        'Please enter a valid IFSC code.',
      )

      return false
    }


    return true
  }


  // =========================================================
  // NEXT STEP
  // =========================================================

  function handleNext() {
    setError('')


    if (currentStep === 1) {
      if (!validateStepOne()) {
        return
      }


      setCurrentStep(2)

      return
    }


    if (currentStep === 2) {
      if (!validateStepTwo()) {
        return
      }


      setCurrentStep(3)
    }
  }


  // =========================================================
  // PROGRESS STEP NAVIGATION
  // =========================================================

  function handleProgressStep(step) {
    setError('')


    if (step === 1) {
      setCurrentStep(1)
      return
    }


    if (step === 2) {
      if (currentStep < 2) {
        if (!validateStepOne()) {
          return
        }
      }


      setCurrentStep(2)
      return
    }


    if (step === 3) {
      if (currentStep < 3) {
        if (!validateStepOne()) {
          return
        }


        if (!validateStepTwo()) {
          return
        }
      }


      setCurrentStep(3)
    }
  }


  // =========================================================
  // PREVIOUS STEP
  // =========================================================

  function handleBack() {
    setError('')


    if (currentStep > 1) {
      setCurrentStep(
        (currentStepValue) =>
          currentStepValue - 1,
      )
    }
  }


  // =========================================================
  // FINAL SUBMIT
  // =========================================================

  function handleSubmit(event) {
    event.preventDefault()


    setError('')


    if (currentStep !== 3) {
      handleNext()
      return
    }


    /*
     * Automated Razorpay payouts are currently
     * unavailable for this Marketplace account.
     *
     * No Razorpay Route account is created here.
     *
     * Creator earnings continue to use the
     * Marketplace manual payout process.
     */

    setIsSubmitting(true)


    setTimeout(() => {
      setIsSubmitting(false)
      setIsCompleted(true)
    }, 400)
  }


  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <main className="creator-automated-payouts-page">

        <section className="creator-automated-payouts-container">

          <div className="creator-automated-payouts-loading">

            <div className="creator-automated-payouts-spinner" />

            <strong>
              Checking your payout setup...
            </strong>

            <span>
              Please wait while we check your current
              automated payout information.
            </span>

          </div>

        </section>

      </main>
    )
  }


  // =========================================================
  // COMPLETED STATE
  // =========================================================

  if (isCompleted) {
    return (
      <main className="creator-automated-payouts-page">

        <section className="creator-automated-payouts-container">

          <Link
            to="/creator/dashboard"
            className="creator-automated-payouts-back"
          >
            ← Back to Dashboard
          </Link>


          <section className="creator-automated-payouts-card">

            <div className="creator-automated-payouts-complete">

              <div className="creator-automated-payouts-complete-icon">
                ✓
              </div>


              <p className="creator-automated-payouts-eyebrow">
                Payout Information
              </p>


              <h1>
                Payout information saved
              </h1>


              <p className="creator-automated-payouts-complete-description">
                Your payout information has been reviewed
                successfully. However, automated Razorpay
                payouts are currently unavailable for this
                Marketplace account.
              </p>


              <div className="creator-automated-payouts-manual-card">

                <div className="creator-automated-payouts-manual-icon">
                  ₹
                </div>


                <div>

                  <strong>
                    Current payout method
                  </strong>


                  <span>
                    Manual payout
                  </span>


                  <small>
                    Your Creator earnings will continue
                    to be paid manually by the Marketplace
                    Admin using your saved payout details.
                  </small>

                </div>

              </div>


              <div className="creator-automated-payouts-info-box">

                <strong>
                  Automated payouts are not active
                </strong>


                <span>
                  No automatic money transfer has been
                  activated. You do not need to take any
                  additional action right now.
                </span>

              </div>


              {routeAccount && (

                <div className="creator-automated-payouts-status-card">

                  <div className="creator-automated-payouts-status-icon">
                    ✓
                  </div>


                  <div>

                    <strong>
                      Existing payout account found
                    </strong>


                    <span>
                      Your account information is already
                      associated with a payout setup.
                    </span>

                  </div>

                </div>

              )}


              <div className="creator-automated-payouts-complete-actions">

                <Link
                  to="/creator/finances"
                  className="creator-automated-payouts-continue"
                >
                  View Earnings & Payouts →
                </Link>


                <Link
                  to="/creator/payment-settings"
                  className="creator-automated-payouts-secondary-button"
                >
                  Payment Settings
                </Link>

              </div>

            </div>

          </section>

        </section>

      </main>
    )
  }


  return (
    <main className="creator-automated-payouts-page">

      <section className="creator-automated-payouts-container">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          to="/creator/dashboard"
          className="creator-automated-payouts-back"
        >
          ← Back to Dashboard
        </Link>


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="creator-automated-payouts-header">

          <div className="creator-automated-payouts-badge">
            <span />
            Automated Payouts
          </div>


          <h1>
            Set up automated payouts
          </h1>


          <p>
            Complete a few simple steps to review your
            payout information. Automated Razorpay
            payouts are currently unavailable for this
            Marketplace account.
          </p>

        </header>


        {/* =================================================
            EXISTING ACCOUNT
        ================================================= */}

        {routeAccount && (

          <section className="creator-automated-payouts-status-card">

            <div className="creator-automated-payouts-status-icon">
              ✓
            </div>


            <div>

              <strong>
                Your payout setup already exists
              </strong>


              <span>
                Your payout account information is already
                connected or currently being processed.
              </span>

            </div>

          </section>

        )}


        {/* =================================================
            PROGRESS
        ================================================= */}

        <section className="creator-automated-payouts-progress">

          <button
            type="button"
            className={
              currentStep >= 1
                ? 'active'
                : ''
            }
            onClick={() =>
              handleProgressStep(1)
            }
          >

            <span>
              1
            </span>


            <strong>
              Basic information
            </strong>

          </button>


          <button
            type="button"
            className={
              currentStep >= 2
                ? 'active'
                : ''
            }
            onClick={() =>
              handleProgressStep(2)
            }
          >

            <span>
              2
            </span>


            <strong>
              Business & bank
            </strong>

          </button>


          <button
            type="button"
            className={
              currentStep >= 3
                ? 'active'
                : ''
            }
            onClick={() =>
              handleProgressStep(3)
            }
          >

            <span>
              3
            </span>


            <strong>
              Review
            </strong>

          </button>

        </section>


        {/* =================================================
            MAIN CARD
        ================================================= */}

        <section className="creator-automated-payouts-card">

          <div className="creator-automated-payouts-card-header">

            <div>

              <p className="creator-automated-payouts-eyebrow">
                Step {currentStep} of 3
              </p>


              <h2>

                {currentStep === 1 &&
                  'Tell us about yourself'}

                {currentStep === 2 &&
                  'Add your business and bank details'}

                {currentStep === 3 &&
                  'Review your information'}

              </h2>


              <p>

                {currentStep === 1 &&
                  'Start with a few basic details about the account that will receive your payouts.'}

                {currentStep === 2 &&
                  'These details help us keep your payout information organized.'}

                {currentStep === 3 &&
                  'Check your information before completing the payout setup review.'}

              </p>

            </div>

          </div>


          <form
            className="creator-automated-payouts-form"
            onSubmit={handleSubmit}
          >

            {/* =================================================
                STEP 1
            ================================================= */}

            {currentStep === 1 && (

              <>

                <div className="creator-automated-payouts-field">

                  <label>
                    Email
                  </label>


                  <div className="creator-automated-payouts-readonly">

                    <span>
                      {auth.user?.email ||
                        'Email not available'}
                    </span>


                    <small>
                      ✓ Marketplace account email
                    </small>

                  </div>

                </div>


                <div className="creator-automated-payouts-field">

                  <label htmlFor="phone">
                    Mobile Number
                  </label>


                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />


                  <small>
                    Use a mobile number that you can
                    access for verification.
                  </small>

                </div>


                <div className="creator-automated-payouts-field">

                  <label htmlFor="payoutName">
                    Name for Payouts
                  </label>


                  <input
                    id="payoutName"
                    name="payoutName"
                    type="text"
                    value={formData.payoutName}
                    onChange={handleChange}
                    placeholder="Your full name or business name"
                    autoComplete="name"
                  />


                  <small>
                    This should match the name associated
                    with your payout account.
                  </small>

                </div>


                <fieldset className="creator-automated-payouts-account-type">

                  <legend>
                    How will you receive payouts?
                  </legend>


                  <label
                    className={
                      formData.accountType ===
                      'INDIVIDUAL'
                        ? 'selected'
                        : ''
                    }
                  >

                    <input
                      type="radio"
                      name="accountType"
                      value="INDIVIDUAL"
                      checked={
                        formData.accountType ===
                        'INDIVIDUAL'
                      }
                      onChange={handleChange}
                    />


                    <span>

                      <strong>
                        I'm an individual
                      </strong>


                      <small>
                        I receive Marketplace earnings
                        in my own name.
                      </small>

                    </span>

                  </label>


                  <label
                    className={
                      formData.accountType ===
                      'REGISTERED_BUSINESS'
                        ? 'selected'
                        : ''
                    }
                  >

                    <input
                      type="radio"
                      name="accountType"
                      value="REGISTERED_BUSINESS"
                      checked={
                        formData.accountType ===
                        'REGISTERED_BUSINESS'
                      }
                      onChange={handleChange}
                    />


                    <span>

                      <strong>
                        I'm a registered business
                      </strong>


                      <small>
                        I receive Marketplace earnings
                        under a registered business name.
                      </small>

                    </span>

                  </label>

                </fieldset>

              </>

            )}


            {/* =================================================
                STEP 2
            ================================================= */}

            {currentStep === 2 && (

              <>

                {formData.accountType ===
                  'REGISTERED_BUSINESS' && (

                  <>

                    <div className="creator-automated-payouts-info-box">

                      <strong>
                        Business information
                      </strong>


                      <span>
                        Enter the business details that
                        customers see and the legal name
                        associated with the business.
                      </span>

                    </div>


                    <div className="creator-automated-payouts-field">

                      <label htmlFor="legalBusinessName">
                        Legal Business Name
                      </label>


                      <input
                        id="legalBusinessName"
                        name="legalBusinessName"
                        type="text"
                        value={
                          formData.legalBusinessName
                        }
                        onChange={handleChange}
                        placeholder="Example: ABC Technologies Pvt. Ltd."
                        autoComplete="organization"
                      />

                    </div>


                    <div className="creator-automated-payouts-field">

                      <label htmlFor="customerFacingBusinessName">
                        Customer-facing Business Name
                      </label>


                      <input
                        id="customerFacingBusinessName"
                        name="customerFacingBusinessName"
                        type="text"
                        value={
                          formData.customerFacingBusinessName
                        }
                        onChange={handleChange}
                        placeholder="Example: ABC Websites"
                      />


                      <small>
                        This is the name your customers
                        know your business by.
                      </small>

                    </div>


                    <div className="creator-automated-payouts-field">

                      <label htmlFor="businessType">
                        Business Type
                      </label>


                      <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                      >

                        <option value="">
                          Select your business type
                        </option>

                        <option value="PRIVATE_LIMITED">
                          Private Limited Company
                        </option>

                        <option value="LLP">
                          LLP
                        </option>

                        <option value="PARTNERSHIP">
                          Partnership
                        </option>

                        <option value="PROPRIETORSHIP">
                          Proprietorship
                        </option>

                        <option value="OTHER">
                          Other
                        </option>

                      </select>

                    </div>

                  </>

                )}


                <div className="creator-automated-payouts-info-box">

                  <strong>
                    Bank account
                  </strong>


                  <span>
                    Your existing payment details have
                    been loaded where available. Check
                    them carefully before continuing.
                  </span>

                </div>


                <div className="creator-automated-payouts-field">

                  <label htmlFor="accountHolderName">
                    Bank Account Holder Name
                  </label>


                  <input
                    id="accountHolderName"
                    name="accountHolderName"
                    type="text"
                    value={
                      formData.accountHolderName
                    }
                    onChange={handleChange}
                    placeholder="Name on your bank account"
                    autoComplete="name"
                  />

                </div>


                <div className="creator-automated-payouts-two-column">

                  <div className="creator-automated-payouts-field">

                    <label htmlFor="bankName">
                      Bank Name
                    </label>


                    <input
                      id="bankName"
                      name="bankName"
                      type="text"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="Example: HDFC Bank"
                    />

                  </div>


                  <div className="creator-automated-payouts-field">

                    <label htmlFor="accountNumber">
                      Bank Account Number
                    </label>


                    <input
                      id="accountNumber"
                      name="accountNumber"
                      type="text"
                      inputMode="numeric"
                      value={
                        formData.accountNumber
                      }
                      onChange={handleChange}
                      placeholder="Enter account number"
                      autoComplete="off"
                    />

                  </div>

                </div>


                <div className="creator-automated-payouts-two-column">

                  <div className="creator-automated-payouts-field">

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
                      maxLength={11}
                      onInput={(event) => {
                        event.currentTarget.value =
                          event.currentTarget.value
                            .toUpperCase()
                      }}
                    />

                  </div>


                  <div className="creator-automated-payouts-field">

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
                      Optional if you are providing
                      bank account details.
                    </small>

                  </div>

                </div>

              </>

            )}


            {/* =================================================
                STEP 3
            ================================================= */}

            {currentStep === 3 && (

              <div className="creator-automated-payouts-review">

                <div className="creator-automated-payouts-review-section">

                  <div className="creator-automated-payouts-review-heading">

                    <strong>
                      Basic information
                    </strong>


                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(1)
                        setError('')
                      }}
                    >
                      Edit
                    </button>

                  </div>


                  <div className="creator-automated-payouts-review-grid">

                    <div>
                      <span>
                        Email
                      </span>


                      <strong>
                        {auth.user?.email || '—'}
                      </strong>

                    </div>


                    <div>
                      <span>
                        Mobile Number
                      </span>


                      <strong>
                        {formData.phone || '—'}
                      </strong>

                    </div>


                    <div>
                      <span>
                        Payout Name
                      </span>


                      <strong>
                        {formData.payoutName || '—'}
                      </strong>

                    </div>


                    <div>
                      <span>
                        Account Type
                      </span>


                      <strong>
                        {formData.accountType ===
                        'REGISTERED_BUSINESS'
                          ? 'Registered Business'
                          : 'Individual'}
                      </strong>

                    </div>

                  </div>

                </div>


                {formData.accountType ===
                  'REGISTERED_BUSINESS' && (

                  <div className="creator-automated-payouts-review-section">

                    <div className="creator-automated-payouts-review-heading">

                      <strong>
                        Business information
                      </strong>


                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(2)
                          setError('')
                        }}
                      >
                        Edit
                      </button>

                    </div>


                    <div className="creator-automated-payouts-review-grid">

                      <div>
                        <span>
                          Legal Business Name
                        </span>


                        <strong>
                          {formData.legalBusinessName ||
                            '—'}
                        </strong>

                      </div>


                      <div>
                        <span>
                          Customer-facing Name
                        </span>


                        <strong>
                          {formData.customerFacingBusinessName ||
                            '—'}
                        </strong>

                      </div>


                      <div>
                        <span>
                          Business Type
                        </span>


                        <strong>
                          {formData.businessType ||
                            '—'}
                        </strong>

                      </div>

                    </div>

                  </div>

                )}


                <div className="creator-automated-payouts-review-section">

                  <div className="creator-automated-payouts-review-heading">

                    <strong>
                      Bank information
                    </strong>


                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(2)
                        setError('')
                      }}
                    >
                      Edit
                    </button>

                  </div>


                  <div className="creator-automated-payouts-review-grid">

                    <div>
                      <span>
                        Account Holder
                      </span>


                      <strong>
                        {formData.accountHolderName ||
                          '—'}
                      </strong>

                    </div>


                    <div>
                      <span>
                        Bank
                      </span>


                      <strong>
                        {formData.bankName || '—'}
                      </strong>

                    </div>


                    <div>
                      <span>
                        Account Number
                      </span>


                      <strong>
                        {formData.accountNumber
                          ? `••••${formData.accountNumber.slice(-4)}`
                          : '—'}
                      </strong>

                    </div>


                    <div>
                      <span>
                        IFSC
                      </span>


                      <strong>
                        {formData.ifscCode || '—'}
                      </strong>

                    </div>


                    <div>
                      <span>
                        UPI ID
                      </span>


                      <strong>
                        {formData.upiId ||
                          'Not provided'}
                      </strong>

                    </div>

                  </div>

                </div>


                <div className="creator-automated-payouts-review-notice">

                  <strong>
                    Automated payouts are currently unavailable
                  </strong>


                  <span>
                    Your information will be reviewed for
                    record-keeping purposes. Automated
                    Razorpay payouts are not currently
                    available for this Marketplace account.
                  </span>

                </div>

              </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="creator-automated-payouts-error">
                {error}
              </div>

            )}


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="creator-automated-payouts-footer">

              <div>

                <strong>
                  Your information is secure
                </strong>


                <span>
                  Your payout information will only be
                  used for setting up and managing your
                  Marketplace payouts.
                </span>

              </div>


              <div className="creator-automated-payouts-footer-actions">

                {currentStep > 1 && (

                  <button
                    type="button"
                    className="creator-automated-payouts-back-button"
                    onClick={handleBack}
                  >
                    ← Back
                  </button>

                )}


                <button
                  type="submit"
                  className="creator-automated-payouts-continue"
                  disabled={isSubmitting}
                >

                  {isSubmitting
                    ? 'Saving...'
                    : currentStep === 3
                      ? 'Complete Setup'
                      : 'Continue →'}

                </button>

              </div>

            </div>

          </form>

        </section>

      </section>

    </main>
  )
}


export default CreatorAutomatedPayoutsPage