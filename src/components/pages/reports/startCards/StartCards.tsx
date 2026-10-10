import { useMemo } from "react";
import clsx from "clsx";
import type { Transaction } from "../../dashboard/Dashboard";
import type { ReportPeriod } from "../actionBar/ActionBar";
import css from "./startCards.module.css";

import sparklineUp from "../../../../assets/icons/sparkline-up.svg";
import sparklineDown from "../../../../assets/icons/sparkline-down.svg";

interface StartCardsProps {
  transactions: Transaction[];
  period: ReportPeriod;
  selectedDate?: Date;
  currency?: string;
  monthlyTarget?: number;
}

export default function StartCards({
  transactions,
  period,
  selectedDate = new Date(),
  currency = "UAH",
  monthlyTarget = 15000,
}: StartCardsProps) {
  const stats = useMemo(() => {
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();

    const isInCurrentPeriod = (txDate: Date) => {
      const year = txDate.getFullYear();
      const month = txDate.getMonth();

      if (period === "month") {
        return year === currentYear && month === currentMonth;
      }
      if (period === "quarter") {
        const currentQuarter = Math.floor(currentMonth / 3);
        const txQuarter = Math.floor(month / 3);
        return year === currentYear && currentQuarter === txQuarter;
      }
      if (period === "year") {
        return year === currentYear;
      }
      return true;
    };

    const isInPreviousPeriod = (txDate: Date) => {
      const year = txDate.getFullYear();
      const month = txDate.getMonth();

      if (period === "month") {
        const prevDate = new Date(currentYear, currentMonth - 1, 1);
        return year === prevDate.getFullYear() && month === prevDate.getMonth();
      }
      if (period === "quarter") {
        const currentQuarter = Math.floor(currentMonth / 3);
        const prevQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
        const prevQuarterYear =
          currentQuarter === 0 ? currentYear - 1 : currentYear;
        const txQuarter = Math.floor(month / 3);
        return year === prevQuarterYear && txQuarter === prevQuarter;
      }
      if (period === "year") {
        return year === currentYear - 1;
      }
      return false;
    };

    let currentInflow = 0;
    let currentOutflow = 0;
    let prevInflow = 0;
    let currentPeriodTxCount = 0;

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const txDate = new Date(tx.date);
      const amount = Number(tx.amount) || 0;

      if (isInCurrentPeriod(txDate)) {
        currentPeriodTxCount++;
        if (tx.type === "income") currentInflow += amount;
        if (tx.type === "expense") currentOutflow += amount;
      } else if (isInPreviousPeriod(txDate)) {
        if (tx.type === "income") prevInflow += amount;
      }
    });

    const netBalance = currentInflow - currentOutflow;

    const multiplier = period === "quarter" ? 3 : period === "year" ? 12 : 1;
    const target = monthlyTarget * multiplier;

    const goalPercent =
      target > 0
        ? Math.min(100, Math.max(0, Math.round((netBalance / target) * 100)))
        : 0;

    const savingsRate =
      currentInflow > 0
        ? Math.min(
            100,
            Math.max(0, Math.round((netBalance / currentInflow) * 100)),
          )
        : 0;

    const inflowDelta = currentInflow - prevInflow;
    const inflowPercent =
      prevInflow > 0 ? ((inflowDelta / prevInflow) * 100).toFixed(1) : null;

    const burnRatePercent =
      currentInflow > 0
        ? Math.min(100, Math.round((currentOutflow / currentInflow) * 100))
        : currentOutflow > 0
          ? 100
          : 0;

    return {
      currentInflow,
      currentOutflow,
      netBalance,
      target,
      goalPercent,
      savingsRate,
      inflowDelta,
      inflowPercent,
      burnRatePercent,
      currentPeriodTxCount,
    };
  }, [transactions, period, monthlyTarget, selectedDate]);

  const formatAmount = (num: number) => {
    return Math.abs(num).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const isNetPositive = stats.netBalance >= 0;

  const getTargetFooterText = () => {
    if (period === "allTime") {
      return `Savings rate: ${stats.savingsRate}% of income`;
    }
    const unit =
      period === "month" ? "mo" : period === "quarter" ? "qtr" : "yr";
    return `Target: ${stats.target.toLocaleString("en-US")} ${currency}/${unit}`;
  };

  const getInflowComparisonText = () => {
    if (period === "allTime") {
      return `${stats.currentPeriodTxCount} total transactions`;
    }
    const periodName =
      period === "month"
        ? "last month"
        : period === "quarter"
          ? "last quarter"
          : "last year";

    return `${stats.inflowDelta >= 0 ? "+" : "-"}${formatAmount(stats.inflowDelta)} ${currency} vs ${periodName}`;
  };

  return (
    <div className={css.startCards}>
      <div className={css.statCard}>
        <div className={css.cardTop}>
          <div className={css.labelRow}>
            <span className={css.label}>TOTAL NET BALANCE</span>
            <div className={clsx(css.badge, css.badgeOrange)}>
              <span className="material-symbols-outlined">
                {period === "allTime" ? "savings" : "flag"}
              </span>
              <span>
                {period === "allTime"
                  ? `${stats.savingsRate}% Saved`
                  : `${stats.goalPercent}% Goal`}
              </span>
            </div>
          </div>

          <div className={css.amountRow}>
            <span
              className={clsx(css.amount, {
                [css.amountGreen]: isNetPositive,
                [css.amountRed]: !isNetPositive,
              })}
            >
              {isNetPositive ? "+" : "-"}
              {formatAmount(stats.netBalance)}
            </span>
            <span className={css.currency}>{currency}</span>
          </div>
        </div>

        <div className={css.cardFooter}>
          <span className={css.footerText}>{getTargetFooterText()}</span>
          <div className={css.progressBarTrack}>
            <div
              className={css.progressBarFill}
              style={{
                width: `${period === "allTime" ? stats.savingsRate : stats.goalPercent}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className={css.statCard}>
        <div className={css.cardTop}>
          <div className={css.labelRow}>
            <span className={css.label}>INFLOW VELOCITY</span>
            {period !== "allTime" && stats.inflowPercent !== null ? (
              <div
                className={clsx(css.badge, {
                  [css.badgeGreen]: Number(stats.inflowPercent) >= 0,
                  [css.badgeRed]: Number(stats.inflowPercent) < 0,
                })}
              >
                <span className="material-symbols-outlined">
                  {Number(stats.inflowPercent) >= 0
                    ? "trending_up"
                    : "trending_down"}
                </span>
                <span>
                  {Number(stats.inflowPercent) >= 0 ? "+" : ""}
                  {stats.inflowPercent}%
                </span>
              </div>
            ) : (
              <div className={clsx(css.badge, css.badgeGreen)}>
                <span className="material-symbols-outlined">payments</span>
                <span>Inflow</span>
              </div>
            )}
          </div>

          <div className={css.amountRow}>
            <span className={clsx(css.amount, css.amountGreen)}>
              +{formatAmount(stats.currentInflow)}
            </span>
            <span className={css.currency}>{currency}</span>
          </div>
        </div>

        <div className={css.cardFooter}>
          <span className={css.footerText}>{getInflowComparisonText()}</span>
          <img
            src={stats.inflowDelta >= 0 ? sparklineUp : sparklineDown}
            alt="sparkline"
            className={css.sparkline}
          />
        </div>
      </div>

      <div className={css.statCard}>
        <div className={css.cardTop}>
          <div className={css.labelRow}>
            <span className={css.label}>OUTFLOW BURN RATE</span>
            <div className={clsx(css.badge, css.badgeRed)}>
              <span className="material-symbols-outlined">
                local_fire_department
              </span>
              <span>{stats.burnRatePercent}%</span>
            </div>
          </div>

          <div className={css.amountRow}>
            <span className={clsx(css.amount, css.amountRed)}>
              -{formatAmount(stats.currentOutflow)}
            </span>
            <span className={css.currency}>{currency}</span>
          </div>
        </div>

        <div className={css.cardFooter}>
          <span className={css.footerText}>
            {stats.burnRatePercent}% of total income burned
          </span>
          <img src={sparklineDown} alt="sparkline" className={css.sparkline} />
        </div>
      </div>
    </div>
  );
}
