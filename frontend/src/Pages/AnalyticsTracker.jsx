import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_MEASUREMENT_ID = "G-X7Q27ZEQM9";

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
}

export default AnalyticsTracker;