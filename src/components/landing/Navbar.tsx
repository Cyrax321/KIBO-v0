import * as React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import kiboLogo from "@/assets/kibo-logo.png";

interface NavbarProps {
  className?: string;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { 
    label: "Resources", 
    href: "#",
    dropdown: [
      { label: "CS Arena", href: "/arena" },
      { label: "Application Tracker", href: "/applications" },
      { label: "Mock Interviews", href: "/assessments" },
    ]
  },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm" 
          : "bg-transparent",
        className
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.img 
              src={kiboLogo} 
              alt="Kibo" 
              className="h-10 w-10 rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-105" 
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
            />
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              kibo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div 
                key={link.label} 
                className="relative"
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.dropdown ? (
                  <>
                    <button
                      className={cn(
                        "flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                        activeDropdown === link.label && "text-foreground"
                      )}
                    >
                      {link.label}
                      <ChevronDown className={cn(
                        "h-4 w-4 stroke-[1.5] transition-transform",
                        activeDropdown === link.label && "rotate-180"
                      )} />
                    </button>
                    
                    {/* Dropdown */}
                    {activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-white border border-border shadow-lg py-2 z-50"
                      >
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </>
                ) : (
                  <Link
                    to={link.href}
                    onClick={() => handleLinkClick(link.href)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 stroke-[1.5]" />
            ) : (
              <Menu className="h-6 w-6 stroke-[1.5]" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-t border-white/20 bg-white/95 backdrop-blur-xl"
        >
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                {link.dropdown ? (
                  <div className="space-y-1">
                    <div className="px-4 py-2 text-sm font-medium text-foreground">
                      {link.label}
                    </div>
                    <div className="pl-4 space-y-1">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={link.href}
                    onClick={() => handleLinkClick(link.href)}
                    className="block px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            
            <div className="pt-4 border-t border-border space-y-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-muted-foreground"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block"
              >
                <button className="w-full h-10 rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export { Navbar };
