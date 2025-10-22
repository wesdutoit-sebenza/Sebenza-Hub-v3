import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4" data-testid="text-footer-product">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/recruiters">
                  <a data-testid="link-footer-recruiters" className="text-sm text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded-md inline-block">
                    For Recruiters
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/businesses">
                  <a data-testid="link-footer-businesses" className="text-sm text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded-md inline-block">
                    For Businesses
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/individuals">
                  <a data-testid="link-footer-individuals" className="text-sm text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded-md inline-block">
                    For Individuals
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4" data-testid="text-footer-legal">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" data-testid="link-footer-privacy" className="text-sm text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded-md inline-block">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" data-testid="link-footer-popia" className="text-sm text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded-md inline-block">
                  POPIA Compliance
                </a>
              </li>
              <li>
                <a href="#" data-testid="link-footer-terms" className="text-sm text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded-md inline-block">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4" data-testid="text-footer-contact">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:hello@yourdomain.co.za"
                  data-testid="link-footer-email"
                  className="text-sm text-muted-foreground hover:text-foreground hover-elevate px-2 py-1 rounded-md inline-block"
                >
                  hello@yourdomain.co.za
                </a>
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span data-testid="text-footer-location">🇿🇦 Built in SA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p data-testid="text-footer-copyright">&copy; {new Date().getFullYear()} HireMove. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
