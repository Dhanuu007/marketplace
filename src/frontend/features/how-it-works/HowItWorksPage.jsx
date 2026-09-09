import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import './HowItWorksPage.css'


const creatorSteps = [
  {
    number: '01',
    title: 'Create Your Creator Account',
    description:
      'Register as a Creator and access your Creator Dashboard to begin selling your websites.',
    icon: '01',
  },
  {
    number: '02',
    title: 'Build Your Website',
    description:
      'Create your website using the tools and technology you prefer, then prepare it for the marketplace.',
    icon: '02',
  },
  {
    number: '03',
    title: 'Create Your Listing',
    description:
      'Add your website name, description, category, price, screenshots and other required listing information.',
    icon: '03',
  },
  {
    number: '04',
    title: 'Submit for Review',
    description:
      'Submit your website listing to Market Palce. The listing goes through the marketplace review process.',
    icon: '04',
  },
  {
    number: '05',
    title: 'Get Approved & Go Live',
    description:
      'Once your listing is approved, it becomes available for Buyers to discover on the marketplace.',
    icon: '05',
  },
  {
    number: '06',
    title: 'Make a Sale',
    description:
      'A Buyer discovers your website and completes the purchase through the Market Palce checkout.',
    icon: '06',
  },
  {
    number: '07',
    title: 'Earn From Your Sale',
    description:
      'Creators receive 95% of the paid sale amount while Market Palce keeps a 5% marketplace commission.',
    icon: '07',
  },
]


const buyerSteps = [
  {
    number: '01',
    title: 'Browse Websites',
    description:
      'Explore websites from different Creators through categories, featured products and marketplace listings.',
    icon: '01',
  },
  {
    number: '02',
    title: 'Explore a Listing',
    description:
      'Open a website listing to view its name, Creator, description, screenshots, price and available information.',
    icon: '02',
  },
  {
    number: '03',
    title: 'Add to Cart',
    description:
      'Add the website you like to your cart and continue shopping or move toward checkout.',
    icon: '03',
  },
  {
    number: '04',
    title: 'Login or Register',
    description:
      'You can browse as a guest, but you need a Buyer account to complete the checkout process.',
    icon: '04',
  },
  {
    number: '05',
    title: 'Review Your Order',
    description:
      'Check your selected website and provide the required customer information before payment.',
    icon: '05',
  },
  {
    number: '06',
    title: 'Pay Securely',
    description:
      'Complete your payment through Razorpay using the secure payment checkout.',
    icon: '06',
  },
  {
    number: '07',
    title: 'Purchase Completed',
    description:
      'After successful payment verification, your order is created and the purchase is recorded in your Buyer account.',
    icon: '07',
  },
]


const faqs = [
  {
    question: 'What is Market Palce?',
    answer:
      'Market Palce is a marketplace where Creators can list websites for sale and Buyers can discover and purchase websites they need.',
  },
  {
    question: 'Who can become a Creator?',
    answer:
      'People who want to sell websites through Market Palce can register as Creators and use the Creator Dashboard to manage their listings.',
  },
  {
    question: 'Can I browse the marketplace without an account?',
    answer:
      'Yes. Visitors can browse categories, products and website listings without creating an account.',
  },
  {
    question: 'Do I need an account to purchase a website?',
    answer:
      'Yes. A Buyer account is required to complete the checkout process.',
  },
  {
    question: 'How does a Creator list a website?',
    answer:
      'Creators can use their Creator Dashboard to create a website listing and submit it for the marketplace review process.',
  },
  {
    question: 'Does every listing become available immediately?',
    answer:
      'No. Submitted listings go through the marketplace review and approval process before becoming available to Buyers.',
  },
  {
    question: 'What is the Market Palce commission?',
    answer:
      'Market Palce keeps a 5% marketplace commission from a successful website sale.',
  },
  {
    question: 'How much does the Creator earn?',
    answer:
      'The Creator receives 95% of the paid sale amount.',
  },
  {
    question: 'How do Buyers pay?',
    answer:
      'Buyers complete their payment through Razorpay during checkout.',
  },
  {
    question: 'What happens after I complete my payment?',
    answer:
      'The payment is verified, an order is created and the purchase is recorded in your Buyer account.',
  },
]


function WorkflowStep({ step }) {
  return (
    <article className="how-it-works-step">

      <div className="how-it-works-step-number">
        {step.icon}
      </div>

      <div className="how-it-works-step-content">

        <span className="how-it-works-step-label">
          STEP {step.number}
        </span>

        <h3>
          {step.title}
        </h3>

        <p>
          {step.description}
        </p>

      </div>

    </article>
  )
}


function FAQItem({ faq }) {
  return (
    <details className="how-it-works-faq-item">

      <summary>

        <span>
          {faq.question}
        </span>

        <span className="how-it-works-faq-icon">
          +
        </span>

      </summary>

      <div className="how-it-works-faq-answer">
        <p>
          {faq.answer}
        </p>
      </div>

    </details>
  )
}


export default function HowItWorksPage() {

  const [showBackToTop, setShowBackToTop] = useState(false)


  useEffect(() => {

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)

    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }

  }, [])


  const scrollToTop = () => {

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

  }


  return (

    <main className="how-it-works-page">


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="how-it-works-hero">

        <div className="how-it-works-hero-background">
          <div className="how-it-works-orb how-it-works-orb-one" />
          <div className="how-it-works-orb how-it-works-orb-two" />
          <div className="how-it-works-grid" />
        </div>


        <div className="how-it-works-container">

          {/* BACK TO HOME */}

          <Link
            to="/"
            className="how-it-works-back-home"
          >
            <span>←</span>
            Back to Home
          </Link>


          <div className="how-it-works-hero-content">

            <span className="how-it-works-eyebrow">
              MARKET PALCE GUIDE
            </span>

            <h1>
              How
              <span> Market Palce </span>
              Works
            </h1>

            <p>
              A simple marketplace connecting talented
              Creators who build websites with Buyers
              looking for websites they can purchase.
            </p>


            <div className="how-it-works-hero-actions">

              <a
                href="#creator-workflow"
                className="how-it-works-primary-button"
              >
                I'm a Creator
                <span>↓</span>
              </a>


              <a
                href="#buyer-workflow"
                className="how-it-works-secondary-button"
              >
                I'm a Buyer
                <span>↓</span>
              </a>

            </div>

          </div>


          <div className="how-it-works-hero-visual">

            <div className="how-it-works-hero-card">

              <div className="how-it-works-hero-person">

                <div className="how-it-works-visual-icon">
                  C
                </div>

                <strong>
                  Creator
                </strong>

                <span>
                  Build & Sell
                </span>

              </div>


              <div className="how-it-works-hero-arrow">
                →
              </div>


              <div className="how-it-works-hero-market">

                <div className="how-it-works-visual-icon">
                  M
                </div>

                <strong>
                  Market Palce
                </strong>

                <span>
                  Connect
                </span>

              </div>


              <div className="how-it-works-hero-arrow">
                →
              </div>


              <div className="how-it-works-hero-person">

                <div className="how-it-works-visual-icon">
                  B
                </div>

                <strong>
                  Buyer
                </strong>

                <span>
                  Discover & Buy
                </span>

              </div>

            </div>


            <div className="how-it-works-floating-badge how-it-works-floating-badge-top">
              <span>CREATORS</span>
              <strong>Sell Websites</strong>
            </div>


            <div className="how-it-works-floating-badge how-it-works-floating-badge-bottom">
              <span>BUYERS</span>
              <strong>Discover Websites</strong>
            </div>

          </div>


          {/* HERO SCROLL ARROW */}

          <a
            href="#creator-workflow"
            className="how-it-works-scroll-arrow"
            aria-label="Explore how Market Palce works"
          >
            <span>
              Explore how it works
            </span>

            <strong>
              ↓
            </strong>
          </a>

        </div>

      </section>


      {/* =====================================================
          QUICK OVERVIEW
      ====================================================== */}

      <section className="how-it-works-overview">

        <div className="how-it-works-container">

          <div className="how-it-works-section-heading">

            <span className="how-it-works-eyebrow">
              THE SIMPLE IDEA
            </span>

            <h2>
              One Marketplace. Two Sides.
            </h2>

            <p>
              Market Palce brings Creators and Buyers
              together in one place.
            </p>

          </div>


          <div className="how-it-works-overview-grid">

            <div className="how-it-works-overview-card">

              <div className="how-it-works-overview-icon">
                C
              </div>

              <div>
                <span>FOR CREATORS</span>

                <h3>
                  Build → List → Sell → Earn
                </h3>

                <p>
                  Create websites, list them on the
                  marketplace, reach Buyers and earn from
                  successful sales.
                </p>
              </div>

            </div>


            <div className="how-it-works-overview-card">

              <div className="how-it-works-overview-icon">
                B
              </div>

              <div>
                <span>FOR BUYERS</span>

                <h3>
                  Browse → Choose → Purchase
                </h3>

                <p>
                  Discover websites from different
                  Creators, choose what you need and
                  complete your purchase securely.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CREATOR WORKFLOW
      ====================================================== */}

      <section
        id="creator-workflow"
        className="how-it-works-workflow how-it-works-creator-workflow"
      >

        <div className="how-it-works-container">

          <div className="how-it-works-section-heading">

            <span className="how-it-works-eyebrow">
              FOR CREATORS
            </span>

            <h2>
              From Website to Sale
            </h2>

            <p>
              Everything a Creator needs to know about
              listing and selling a website on Market Palce.
            </p>

          </div>


          <div className="how-it-works-workflow-layout">

            <div className="how-it-works-workflow-intro">

              <div className="how-it-works-large-number">
                01
              </div>

              <h3>
                Your path as a Creator
              </h3>

              <p>
                Build something valuable, present it
                professionally and make it available to
                Buyers through the marketplace.
              </p>

              <div className="how-it-works-workflow-line" />

            </div>


            <div className="how-it-works-steps">

              {creatorSteps.map((step) => (
                <WorkflowStep
                  key={step.number}
                  step={step}
                />
              ))}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          BUYER WORKFLOW
      ====================================================== */}

      <section
        id="buyer-workflow"
        className="how-it-works-workflow how-it-works-buyer-workflow"
      >

        <div className="how-it-works-container">

          <div className="how-it-works-section-heading">

            <span className="how-it-works-eyebrow">
              FOR BUYERS
            </span>

            <h2>
              From Discovery to Purchase
            </h2>

            <p>
              A straightforward journey from finding a
              website to completing your purchase.
            </p>

          </div>


          <div className="how-it-works-workflow-layout how-it-works-workflow-layout-reverse">

            <div className="how-it-works-workflow-intro">

              <div className="how-it-works-large-number">
                02
              </div>

              <h3>
                Your path as a Buyer
              </h3>

              <p>
                Explore different websites, understand
                what you're buying and complete checkout
                securely.
              </p>

              <div className="how-it-works-workflow-line" />

            </div>


            <div className="how-it-works-steps">

              {buyerSteps.map((step) => (
                <WorkflowStep
                  key={step.number}
                  step={step}
                />
              ))}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          MARKETPLACE CONNECTION
      ====================================================== */}

      <section className="how-it-works-connection">

        <div className="how-it-works-container">

          <div className="how-it-works-section-heading">

            <span className="how-it-works-eyebrow">
              HOW IT CONNECTS
            </span>

            <h2>
              Creators Build. Buyers Discover.
            </h2>

            <p>
              Market Palce sits between both sides and
              provides the marketplace infrastructure
              that connects them.
            </p>

          </div>


          <div className="how-it-works-connection-flow">

            <div className="how-it-works-connection-box">

              <div className="how-it-works-connection-icon">
                C
              </div>

              <span>CREATOR</span>

              <strong>
                Creates & Lists
              </strong>

              <p>
                Builds a website and submits it for
                marketplace approval.
              </p>

            </div>


            <div className="how-it-works-connection-arrow">
              →
            </div>


            <div className="how-it-works-connection-box how-it-works-connection-center">

              <div className="how-it-works-connection-icon">
                M
              </div>

              <span>MARKET PALCE</span>

              <strong>
                Connects Both Sides
              </strong>

              <p>
                Provides listings, checkout, payments,
                orders and marketplace infrastructure.
              </p>

            </div>


            <div className="how-it-works-connection-arrow">
              →
            </div>


            <div className="how-it-works-connection-box">

              <div className="how-it-works-connection-icon">
                B
              </div>

              <span>BUYER</span>

              <strong>
                Discovers & Purchases
              </strong>

              <p>
                Finds a website and completes the purchase
                through the marketplace.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PAYMENT / COMMISSION
      ====================================================== */}

      <section className="how-it-works-payment">

        <div className="how-it-works-container">

          <div className="how-it-works-section-heading">

            <span className="how-it-works-eyebrow">
              PAYMENT & COMMISSION
            </span>

            <h2>
              Simple and Transparent
            </h2>

            <p>
              Market Palce uses a straightforward 5%
              marketplace commission model.
            </p>

          </div>


          <div className="how-it-works-money-card">

            <div className="how-it-works-money-total">

              <span>
                Example Website Sale
              </span>

              <strong>
                ₹10,000
              </strong>

            </div>


            <div className="how-it-works-money-flow">

              <div className="how-it-works-money-part">

                <div className="how-it-works-money-circle">
                  5%
                </div>

                <span>
                  MARKET PALCE
                </span>

                <strong>
                  ₹500
                </strong>

                <small>
                  Marketplace commission
                </small>

              </div>


              <div className="how-it-works-money-divider">
                +
              </div>


              <div className="how-it-works-money-part how-it-works-money-creator">

                <div className="how-it-works-money-circle">
                  95%
                </div>

                <span>
                  CREATOR
                </span>

                <strong>
                  ₹9,500
                </strong>

                <small>
                  Creator earnings
                </small>

              </div>

            </div>

          </div>


          <div className="how-it-works-payment-notes">

            <div>
              <strong>
                Buyer
              </strong>

              <p>
                Pays the listed purchase price during
                checkout.
              </p>
            </div>


            <div>
              <strong>
                Market Palce
              </strong>

              <p>
                Keeps 5% of the successful website sale
                as the marketplace commission.
              </p>
            </div>


            <div>
              <strong>
                Creator
              </strong>

              <p>
                Receives 95% of the paid sale amount.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          AFTER PURCHASE
      ====================================================== */}

      <section className="how-it-works-after-purchase">

        <div className="how-it-works-container">

          <div className="how-it-works-section-heading">

            <span className="how-it-works-eyebrow">
              AFTER PURCHASE
            </span>

            <h2>
              What Happens After You Pay?
            </h2>

            <p>
              Your payment passes through a verification
              process before the purchase becomes an order.
            </p>

          </div>


          <div className="how-it-works-after-flow">

            <div className="how-it-works-after-step">

              <span>01</span>

              <div>
                $
              </div>

              <strong>
                Payment
              </strong>

              <p>
                Complete your payment through Razorpay.
              </p>

            </div>


            <div className="how-it-works-after-arrow">
              →
            </div>


            <div className="how-it-works-after-step">

              <span>02</span>

              <div>
                ✓
              </div>

              <strong>
                Verification
              </strong>

              <p>
                Market Palce verifies the successful payment.
              </p>

            </div>


            <div className="how-it-works-after-arrow">
              →
            </div>


            <div className="how-it-works-after-step">

              <span>03</span>

              <div>
                #
              </div>

              <strong>
                Order Created
              </strong>

              <p>
                Your successful purchase becomes an order.
              </p>

            </div>


            <div className="how-it-works-after-arrow">
              →
            </div>


            <div className="how-it-works-after-step">

              <span>04</span>

              <div>
                ✓
              </div>

              <strong>
                Buyer Account
              </strong>

              <p>
                Your purchase is recorded in your Buyer account.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FAQ
      ====================================================== */}

      <section className="how-it-works-faq">

        <div className="how-it-works-container">

          <div className="how-it-works-section-heading">

            <span className="how-it-works-eyebrow">
              FAQ
            </span>

            <h2>
              Frequently Asked Questions
            </h2>

            <p>
              Quick answers to common questions about
              Market Palce.
            </p>

          </div>


          <div className="how-it-works-faq-list">

            {faqs.map((faq) => (
              <FAQItem
                key={faq.question}
                faq={faq}
              />
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="how-it-works-final-cta">

        <div className="how-it-works-container">

          <div className="how-it-works-cta-card">

            <div className="how-it-works-cta-content">

              <span className="how-it-works-eyebrow">
                GET STARTED
              </span>

              <h2>
                Ready to be part of Market Palce?
              </h2>

              <p>
                Whether you're here to sell a website or
                discover one, your Marketplace journey starts here.
              </p>

            </div>


            <div className="how-it-works-cta-actions">

              <Link
                to="/register"
                className="how-it-works-cta-primary"
              >
                Start Selling
                <span>→</span>
              </Link>


              <Link
                to="/products"
                className="how-it-works-cta-secondary"
              >
                Explore Websites
                <span>→</span>
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          BACK TO TOP
      ====================================================== */}

      {showBackToTop && (
        <button
          type="button"
          className="how-it-works-back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <span>↑</span>
          <small>Top</small>
        </button>
      )}


    </main>

  )
}