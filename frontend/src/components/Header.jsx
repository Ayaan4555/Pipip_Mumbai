// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Menu, X, Phone } from "lucide-react";
// import { Button } from "./ui/button";


// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const navLinks = [
//     { href: "#home", label: "Home" },
//     { href: "#about", label: "About" },
//     { href: "#pricing", label: "Pricing" },
//     { href: "#rent", label: "Rent Now" },
//     { href: "#contact", label: "Contact" },
//   ];

  


//   return (
//     <motion.header
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
//     >
//       <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//         {/* Logo */}
//         <a href="#home" className="flex items-center gap-2">
            
//           <img
//             src="/logo.jpeg"
//             alt="Pipip Logo"
//             className="h-20 w-20 object-cover rounded-full "
//           />
//         </a>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex items-center gap-16">
//           {navLinks.map((link) => (
//             <a
//               key={link.href}
//               href={link.href}
//               className="text-foreground/80 hover:text-primary transition-colors font-medium"
//             >
//               {link.label}
//             </a>
//           ))}
//         </nav>

//         {/* CTA Button */}
//         <div className="hidden md:flex items-center gap-4">
//           <a href="tel:9967406205">
//             <Button variant="hero" size="lg" className="gap-2">
//               <Phone className="w-4 h-4" />
//               Call Now
//             </Button>
//           </a>
          

//         </div>

//         {/* Mobile Menu Toggle */}
//         <button
//           className="md:hidden text-foreground p-2"
//           onClick={() => setIsMenuOpen(!isMenuOpen)}
//         >
//           {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       <AnimatePresence>
//         {isMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="md:hidden bg-card border-b border-border"
//           >
//             <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
//               {navLinks.map((link) => (
//                 <a
//                   key={link.href}
//                   href={link.href}
//                   className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   {link.label}
//                 </a>
//               ))}
//               <a href="tel:9967406205" className="mt-2">
//                 <Button variant="hero" size="lg" className="w-full gap-2">
//                   <Phone className="w-4 h-4" />
//                   Call Now
//                 </Button>
//               </a>
//             </nav>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.header>
//   );
// };

// export default Header;



import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "./ui/button";

const HEADER_OFFSET = 96;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Define links: path/id, display label, and whether it's a page or a section
  const navLinks = [
    { id: "home", label: "Home", type: "section" },
    { id: "about", label: "About", type: "section" },
    { id: "pricing", label: "Pricing", type: "section" },
    { id: "/catalog", label: "Catalog", type: "page" }, // Direct page link
    { id: "/contact", label: "Contact", type: "page" },
  ];

  // const handleNavigation = (link) => {
  //   setIsMenuOpen(false);

  //   // Case 1: Direct Page Navigation (Catalog)
  //   if (link.type === "page") {
  //     navigate(link.id);
  //     return;
  //   }

  //   // Case 2: Scroll Navigation from a different page
  //   if (location.pathname !== "/") {
  //     navigate("/", { state: { scrollTo: link.id } });
  //     return;
  //   }

  //   // Case 3: Smooth Scroll on the Home page
  //   const el = document.getElementById(link.id);
  //   if (!el) return;

  //   const y =
  //     el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;

  //   window.scrollTo({
  //     top: y,
  //     behavior: "smooth",
  //   });

  //   window.history.pushState(null, "", `#${link.id}`);
  // };

  const handleNavigation = (link) => {
   // 1. Immediately close the menu so it doesn't block the screen
   setIsMenuOpen(false);

   // 2. Case 1: Direct Page Navigation (Catalog/Contact)
   if (link.type === "page") {
     navigate(link.id);
     return;
   }

   // 3. Case 2: Scroll Navigation from a different page
   if (location.pathname !== "/") {
     navigate("/", { state: { scrollTo: link.id } });
     return;
   }

   // 4. Case 3: Smooth Scroll on the Home page
   // We use a small timeout (10ms) to allow the Mobile Menu
   // to start its closing animation so the scroll position is accurate
   setTimeout(() => {
     const el = document.getElementById(link.id);
     if (!el) return;

     const y =
       el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;

     window.scrollTo({
       top: y,
       behavior: "smooth",
     });

     window.history.pushState(null, "", `#${link.id}`);
   }, 10);
 };


  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo - Clicks back to home top */}
        <button
          onClick={() => handleNavigation({ id: "home", type: "section" })}
        >
          <img
            src="/logo.jpeg"
            alt="Pipip Logo"
            className="h-20 w-20 object-cover rounded-full"
          />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-16">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavigation(link)}
              className={`transition-colors font-medium ${
                location.pathname === link.id
                  ? "text-primary"
                  : "text-foreground/80 hover:text-primary"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex">
          <a href="tel:9967406205">
            <Button variant="hero" size="lg" className="gap-2">
              <Phone className="w-4 h-4" />
              Call Now
            </Button>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavigation(link)}
                  className={`text-left transition-colors font-medium py-2 ${
                    location.pathname === link.id
                      ? "text-primary"
                      : "text-foreground/80"
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <a href="tel:9967406205">
                <Button variant="hero" size="lg" className="w-full gap-2">
                  <Phone className="w-4 h-4" />
                  Call Now
                </Button>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;