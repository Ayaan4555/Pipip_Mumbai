import Header from "../components/Header";
import Footer from "../components/Footer";
import About from "../components/About";
import FAQ from "../components/FAQ";
import ScrollToTop from "../components/ScrollToTop";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Header />
      <main className="pt-24">
        <About />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;