import { useMemo } from "react";
import clsx from "clsx";
import type { Transaction } from "../Dashboard";
import css from "./monthlySummary.module.css";

interface MonthlySummaryProps {
  transactions: Transaction[];
  currency: string;
  year?: number;
}

interface MonthItem {
  name: string;
  monthIndex: number;
  total: number;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MonthlySummary({
  transactions,
  currency,
  year = new Date().getFullYear(),
}: MonthlySummaryProps) {
  const monthlyData = useMemo(() => {
    const totalsByMonth: number[] = Array(12).fill(0);

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const txDate = new Date(tx.date);

      if (txDate.getFullYear() === year) {
        const month = txDate.getMonth();
        const amount = Number(tx.amount);

        if (tx.type === "income") {
          totalsByMonth[month] += amount;
        } else if (tx.type === "expense") {
          totalsByMonth[month] -= amount;
        }
      }
    });

    const list: MonthItem[] = MONTH_NAMES.map((name, index) => ({
      name,
      monthIndex: index,
      total: totalsByMonth[index],
    }));

    return list.slice(5, 11).reverse();
  }, [transactions, year]);

  const formatAmount = (num: number) => {
    return Math.abs(Number(num)).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className={css.monthlySummary}>
      <div className={css.top}>
        <h3 className={css.title}>Monthly Summary</h3>
        <span className={css.year}>{year}</span>
      </div>

      <div className={css.main}>
        {monthlyData.map((item) => {
          const isPositive = item.total > 0;
          const isNegative = item.total < 0;

          return (
            <div key={item.name} className={css.row}>
              <span className={css.monthName}>{item.name}</span>
              <div className={css.amountWrapper}>
                {isPositive && (
                  <span
                    className={clsx(
                      "material-symbols-outlined",
                      css.trendIcon,
                      css.positive,
                    )}
                  >
                    arrow_upward
                  </span>
                )}
                {isNegative && (
                  <span
                    className={clsx(
                      "material-symbols-outlined",
                      css.trendIcon,
                      css.negative,
                    )}
                  >
                    arrow_downward
                  </span>
                )}

                <span
                  className={clsx(css.amount, {
                    [css.positive]: isPositive,
                    [css.negative]: isNegative,
                  })}
                >
                  {isPositive ? "+" : isNegative ? "-" : ""}
                  {formatAmount(item.total)}
                </span>
                <span className={css.currency}>{currency}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
