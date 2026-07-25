import { useLocation } from "react-router-dom";
// import About from "../components/About";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Pricing from "../components/Pricing";
import RentalForm from "../components/RentalForm";
import { useEffect } from "react";
import FeaturedBikes from "../components/FeaturedBIke";
// import FAQ from "../components/FAQ";
import useSEO from "../hooks/useSEO";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";



const Index = () => {

  const location = useLocation();

  useSEO({
    title: "Pipip | Bike Rental in Mumbai - Rent Scooty & Bikes on Rent",
    description: "Affordable self drive bike rental in Mumbai. Rent a scooty or bike online starting from Rs. 600/day . Choose Activa, Burgman , Royal Enfield, and KTM. Easy online booking, pay on pickup."
  });

  useEffect(() => {
    // Check if we just arrived here from another page with a 'scrollTo' instruction
    if (location.state?.scrollTo) {
      const id = location.state.scrollTo;

      // Small timeout to ensure the DOM is fully loaded before scrolling
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 96;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);

      // Clear the state so it doesn't scroll again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        {/* Exciting Booking Token Offer Banner */}
        <section className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-red-500/10 border-2 border-primary/30 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl shadow-orange-500/5 group text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8"
          >
            {/* Glowing Accent Orbs */}
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[11px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full shadow-md shadow-orange-500/20">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
                Special Offer Unlocked
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-black text-foreground tracking-tight leading-none">
                Lock Any Ride for Just <span className="text-gradient-sunset font-extrabold text-4xl md:text-6xl">₹200</span>!
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Why pay full upfront? Book your favorite bike or scooter category pool by paying a token booking amount of only <strong>₹200 online</strong>. Pay the remaining balance (including deposit) only when you pick up!
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const el = document.getElementById("featured-rides");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="gradient-sunset text-white px-8 py-4 rounded-2xl font-black text-base shadow-xl shadow-orange-500/35 hover:shadow-orange-500/50 transition-all flex items-center gap-2"
              >
                Book Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </motion.button>
            </div>
          </motion.div>
        </section>
        <FeaturedBikes />
        {/* <About /> */}
        <Pricing />
        {/* <RentalForm /> */}
        {/* <FAQ /> */}
      </main>
      <Footer />
    </div>
  );
}

export default Index
