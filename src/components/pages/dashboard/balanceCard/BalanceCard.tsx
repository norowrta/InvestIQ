import clsx from "clsx";
import css from "./balanceCard.module.css";

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
  currency: string;
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function BalanceCard({
  balance,
  income,
  expenses,
  currency,
}: BalanceCardProps) {
  return (
    <div className={css.balanceCard}>
      <div className={css.balanceSummary}>
        <span className={css.balanceLabel}>NET CASH FLOW</span>
        <h2
          className={clsx(css.balanceTotal, {
            [css.balanceNegative]: balance < 0,
          })}
        >
          {formatCurrency(balance)}
          <span className={css.currencyUnit}>{currency}</span>
        </h2>
      </div>

      <div className={css.badgeList}>
        <div className={css.divider}></div>

        <div className={clsx(css.badge, css.badgeIncome)}>
          <span className={clsx("material-symbols-outlined", css.badgeIcon)}>
            trending_up
          </span>
          <span className={css.badgeAmount}>
            +{formatCurrency(income)}
            <span className={css.badgeCurrency}>{currency}</span>
          </span>
        </div>

        <div className={clsx(css.badge, css.badgeExpense)}>
          <span className={clsx("material-symbols-outlined", css.badgeIcon)}>
            trending_down
          </span>
          <span className={css.badgeAmount}>
            -{formatCurrency(expenses)}
            <span className={css.badgeCurrency}>{currency}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
