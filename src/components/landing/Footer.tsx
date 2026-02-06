import * as React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import kiboLogo from "@/assets/kibo-logo.png";

interface FooterProps {
  className?: string;
}

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Blog", href: "/blog" },
    { label: "Community", href: "/community" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("border-t border-border bg-muted/30", className)}>
      <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 inline-flex items-center gap-2 group">
              <img src={kiboLogo} alt="Kibo" className="h-10 w-10 rounded-lg" />
              <span className="text-2xl font-black bg-gradient-to-br from-primary via-primary to-primary/60 bg-clip-text text-transparent transition-all group-hover:from-primary/90 group-hover:to-primary/50">
                kibo
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm text-muted-foreground">
              Your career command center. Track applications, practice coding, 
              and land your dream tech role.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Kibo. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
