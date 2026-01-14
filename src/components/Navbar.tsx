import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, UserCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "#partidos", label: "Partidos" },
    { href: "#como-funciona", label: "Cómo funciona" },
    { href: "#ciudades", label: "Ciudades" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 right-0 top-0 z-50 bg-background/80 backdrop-blur-lg"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
              <span className="text-xl font-bold text-primary-foreground">⚽</span>
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              FutMatch
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
            <Button variant="default" size="sm">
              <UserCircle className="h-4 w-4" />
              Registrarse
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="rounded-lg p-2 text-foreground md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border bg-background md:hidden"
        >
          <div className="space-y-4 px-4 py-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-base font-medium text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              <Button variant="outline" className="w-full">
                Iniciar sesión
              </Button>
              <Button variant="default" className="w-full">
                Registrarse
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
