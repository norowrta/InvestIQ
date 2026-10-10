import { useState, useRef, useLayoutEffect } from "react";
import { Link } from "react-router";
import clsx from "clsx";
import css from "./actionBar.module.css";

export type ReportPeriod = "month" | "quarter" | "year" | "allTime";

interface ActionBarProps {
  currentPeriod: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  year?: number;
}

export default function ActionBar({
  currentPeriod,
  onPeriodChange,
  year = new Date().getFullYear(),
}: ActionBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<ReportPeriod, HTMLButtonElement | null>>({
    month: null,
    quarter: null,
    year: null,
    allTime: null,
  });

  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeBtn = btnRefs.current[currentPeriod];
      const container = containerRef.current;
      if (activeBtn && container) {
        const containerRect = container.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        setIndicatorStyle({
          left: btnRect.left - containerRect.left,
          width: btnRect.width,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [currentPeriod]);

  return (
    <div className={css.actionBar}>
      <Link to="/" className={css.returnCard}>
        <div className={css.iconBox}>
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <div className={css.returnCardTxt}>
          <h4 className={css.returnTitle}>Back to Dashboard</h4>
          <p className={css.returnSubtitle}>Overview & transactions</p>
        </div>
      </Link>

      <div className={css.periodSelector} ref={containerRef}>
        <div
          className={css.activeIndicator}
          style={{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: `${indicatorStyle.width}px`,
          }}
        />

        <button
          ref={(el) => {
            btnRefs.current.month = el;
          }}
          type="button"
          className={clsx(
            css.periodBtn,
            currentPeriod === "month" && css.active,
          )}
          onClick={() => onPeriodChange("month")}
        >
          Monthly
        </button>

        <button
          ref={(el) => {
            btnRefs.current.quarter = el;
          }}
          type="button"
          className={clsx(
            css.periodBtn,
            currentPeriod === "quarter" && css.active,
          )}
          onClick={() => onPeriodChange("quarter")}
        >
          Last Quarter
        </button>

        <button
          ref={(el) => {
            btnRefs.current.year = el;
          }}
          type="button"
          className={clsx(
            css.periodBtn,
            currentPeriod === "year" && css.active,
          )}
          onClick={() => onPeriodChange("year")}
        >
          Year {year}
        </button>

        <button
          ref={(el) => {
            btnRefs.current.allTime = el;
          }}
          type="button"
          className={clsx(
            css.periodBtn,
            currentPeriod === "allTime" && css.active,
          )}
          onClick={() => onPeriodChange("allTime")}
        >
          All Time
        </button>
      </div>
    </div>
  );
}
