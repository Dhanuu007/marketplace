import { useEffect, useState } from "react";
import "./MarketplaceIntro.css";

export default function MarketplaceIntro({ onComplete }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setLeaving(true);
    }, 3700);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={
        leaving
          ? "market-intro market-intro-exit"
          : "market-intro"
      }
    >
      <div className="intro-orb intro-orb-one"></div>

      <div className="intro-orb intro-orb-two"></div>

      <div className="intro-grid"></div>

      <div className="intro-center">
        <div className="intro-small">
          WELCOME TO
        </div>

        <div className="intro-title-wrapper">
          <h1 className="intro-title">
            MARKET<span>PLACE</span>
          </h1>
        </div>

        <div className="intro-line">
          <span></span>
        </div>

        <p className="intro-tagline">
          Discover. Buy. Build.
        </p>
      </div>

      <div className="intro-corner intro-corner-top"></div>

      <div className="intro-corner intro-corner-bottom"></div>
    </div>
  );
}