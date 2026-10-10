import type { Transaction } from "../../dashboard/Dashboard";
import type { ReportPeriod } from "../actionBar/ActionBar";
import CategoryList from "./CategoryList";
import DonutChartCard from "./DonutChartCard";
import css from "./categoryBreakdown.module.css";

interface CategoryBreakdownProps {
  transactions?: Transaction[];
  period?: ReportPeriod;
  periodLabel?: string;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

export default function CategoryBreakdown({
  transactions = [],
  period = "month",
  periodLabel,
  onPrevMonth,
  onNextMonth,
}: CategoryBreakdownProps) {
  const isMonthly = period === "month";
  const currentLabel =
    periodLabel ||
    new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  return (
    <div className={css.categoryBreakdown}>
      <div className={css.header}>
        <div className={css.headerTxt}>
          <h2 className={css.title}>Capital Allocation & Category Breakdown</h2>
          <p className={css.subtitle}>
            Holistic breakdown of all expenditure channels and relative weight
          </p>
        </div>

        <div className={css.periodNavigator}>
          {isMonthly && (
            <button
              type="button"
              className={css.navArrowBtn}
              onClick={onPrevMonth}
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}

          <div className={css.periodBadge}>
            <span>{currentLabel}</span>
          </div>

          {isMonthly && (
            <button
              type="button"
              className={css.navArrowBtn}
              onClick={onNextMonth}
              aria-label="Next month"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}
        </div>
      </div>

      <div className={css.mainContent}>
        <DonutChartCard transactions={transactions} currency="UAH" />
        <CategoryList transactions={transactions} currency="UAH" />
      </div>
    </div>
  );
}
