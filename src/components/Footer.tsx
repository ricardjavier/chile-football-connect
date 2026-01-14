import { motion } from "framer-motion";
import { Instagram, Twitter, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    producto: [
      { label: "Partidos", href: "#partidos" },
      { label: "Cómo funciona", href: "#como-funciona" },
      { label: "Ciudades", href: "#ciudades" },
      { label: "Precios", href: "#" },
    ],
    soporte: [
      { label: "Centro de ayuda", href: "#" },
      { label: "Contacto", href: "#" },
      { label: "FAQ", href: "#" },
    ],
    legal: [
      { label: "Privacidad", href: "#" },
      { label: "Términos", href: "#" },
    ],
  };

  const cities = ["Santiago", "Valparaíso", "Concepción", "Temuco", "La Serena"];

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
                <span className="text-xl font-bold text-primary-foreground">⚽</span>
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                FutMatch
              </span>
            </div>
            <p className="mt-4 max-w-xs text-muted-foreground">
              La comunidad de fútbol más grande de Chile. Conectamos jugadores de todo el país.
            </p>
            <div className="mt-6 flex gap-4">
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Mail className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-display font-bold text-foreground">Producto</h4>
            <ul className="space-y-3">
              {footerLinks.producto.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-bold text-foreground">Soporte</h4>
            <ul className="space-y-3">
              {footerLinks.soporte.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display font-bold text-foreground">Ciudades</h4>
            <ul className="space-y-3">
              {cities.map((city) => (
                <li key={city} className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {city}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} FutMatch Chile. Todos los derechos reservados.
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              Hecho con ❤️ en Chile 🇨🇱
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
