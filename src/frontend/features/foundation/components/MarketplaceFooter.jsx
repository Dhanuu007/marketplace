
import './MarketplaceFooter.css'

const SOCIAL_ITEMS = [
  
{
  key: 'instagram',
  label: 'Instagram',
  icon: (
    <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="22"
  height="22"
  fill="none"
  stroke="#ffffff"
  strokeWidth="1.8"
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="0.8"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  ),
},

  {
    key: 'facebook',
    label: 'Facebook',
    icon: 'f',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: 'in',
  },
  {
    key: 'twitter',
    label: 'X',
    icon: '𝕏',
  },
]

function MarketplaceFooter({ socialLinks = {} }) {
  const currentYear = new Date().getFullYear()

  const validLinks = SOCIAL_ITEMS.filter((item) => {
    const url = socialLinks?.[item.key]

    return (
      typeof url === 'string' &&
      /^https?:\/\//i.test(url.trim())
    )
  })

  return (
    <footer className="marketplace-footer">
      <div className="marketplace-footer-inner">

        <div className="marketplace-footer-top">

          <div className="marketplace-footer-brand">
            <h2>Marketplace</h2>

            <p>
              Discover, buy and sell ready-made websites.
              Find the right digital solution for your next idea.
            </p>
          </div>

          {validLinks.length > 0 && (
            <div className="marketplace-footer-social">
              <h3>Follow Us</h3>

              <div className="marketplace-footer-social-icons">
                {validLinks.map((item) => (
                  <a
                    key={item.key}
                    href={socialLinks[item.key].trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${item.label} page`}
                    title={item.label}
                  >
                    <span>{item.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="marketplace-footer-bottom">
          <p>
            © {currentYear} Marketplace. All rights reserved.
          </p>

          <span>
            Made with care for creators and buyers.
          </span>
        </div>

      </div>
    </footer>
  )
}

export default MarketplaceFooter
