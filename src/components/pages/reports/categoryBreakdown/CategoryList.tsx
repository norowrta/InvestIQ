import { useMemo } from "react";
import type { Transaction } from "../../dashboard/Dashboard";
import {
  CATEGORY_PALETTE,
  OTHER_PALETTE,
  getCategoryIcon,
} from "./categoryConfig";
import css from "./categoryList.module.css";

interface CategoryListProps {
  transactions: Transaction[];
  currency?: string;
  maxVisible?: number;
}

export interface ProcessedCategory {
  name: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
  bg: string;
  badgeBg: string;
  border: string;
  icon: string;
}

export default function CategoryList({
  transactions = [],
  currency = "UAH",
  maxVisible = 5,
}: CategoryListProps) {
  const categories = useMemo<ProcessedCategory[]>(() => {
    const expenseMap = new Map<string, { total: number; count: number }>();
    let grandTotal = 0;

    transactions.forEach((tx) => {
      if (tx.type !== "expense") return;
      const amount = Number(tx.amount) || 0;
      const catName = tx.category || "Other";

      grandTotal += amount;
      const curr = expenseMap.get(catName) || { total: 0, count: 0 };
      expenseMap.set(catName, {
        total: curr.total + amount,
        count: curr.count + 1,
      });
    });

    if (grandTotal === 0) return [];

    const sorted = Array.from(expenseMap.entries())
      .map(([name, data]) => ({
        name,
        amount: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    let visibleList = sorted;
    let otherData: { amount: number; count: number } | null = null;

    if (sorted.length > maxVisible) {
      visibleList = sorted.slice(0, maxVisible - 1);
      const remaining = sorted.slice(maxVisible - 1);
      otherData = remaining.reduce(
        (acc, item) => ({
          amount: acc.amount + item.amount,
          count: acc.count + item.count,
        }),
        { amount: 0, count: 0 },
      );
    }

    const result: ProcessedCategory[] = visibleList.map((item, index) => {
      const palette = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
      return {
        name: item.name,
        amount: item.amount,
        count: item.count,
        percentage: Math.round((item.amount / grandTotal) * 100),
        color: palette.color,
        bg: palette.bg,
        badgeBg: palette.badgeBg,
        border: palette.border,
        icon: getCategoryIcon(item.name),
      };
    });

    if (otherData) {
      result.push({
        name: "Other",
        amount: otherData.amount,
        count: otherData.count,
        percentage: Math.round((otherData.amount / grandTotal) * 100),
        color: OTHER_PALETTE.color,
        bg: OTHER_PALETTE.bg,
        badgeBg: OTHER_PALETTE.badgeBg,
        border: OTHER_PALETTE.border,
        icon: "more_horiz",
      });
    }

    return result;
  }, [transactions, maxVisible]);

  if (categories.length === 0) {
    return (
      <div className={css.empty}>
        <p>No expenditure data for this period.</p>
      </div>
    );
  }

  return (
    <div className={css.categoryList}>
      {categories.map((cat) => (
        <div key={cat.name} className={css.categoryItem}>
          <div className={css.cardContent}>
            <div className={css.leftCluster}>
              <div
                className={css.iconBox}
                style={{
                  backgroundColor: cat.bg,
                  color: cat.color,
                  border: cat.border,
                }}
              >
                <span className="material-symbols-outlined">{cat.icon}</span>
              </div>
              <div className={css.textCluster}>
                <span className={css.categoryName}>{cat.name}</span>
                <span className={css.txCount}>
                  {cat.count} {cat.count === 1 ? "transaction" : "transactions"}
                </span>
              </div>
            </div>

            <div className={css.rightCluster}>
              <span className={css.amount}>
                {cat.amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span className={css.currency}>{currency}</span>
              </span>
              <div
                className={css.percentageBadge}
                style={{
                  backgroundColor: cat.badgeBg,
                  color: cat.color,
                  border: cat.border,
                }}
              >
                {cat.percentage}%
              </div>
            </div>
          </div>

          <div className={css.progressTrack}>
            <div
              className={css.progressFill}
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
