import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import type { Transaction, PeriodFilter, PeriodMode } from "../Dashboard";
import css from "./transactionHistory.module.css";

interface TransactionHistoryProps {
  transactions: Transaction[];
  currency: string;
  periodFilter: PeriodFilter;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectMode: (mode: PeriodMode) => void;
  onDelete?: (id: number) => void;
}

export default function TransactionHistory({
  transactions,
  currency,
  periodFilter,
  onPrevMonth,
  onNextMonth,
  onSelectMode,
  onDelete,
}: TransactionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getPeriodLabel = () => {
    const { date, mode } = periodFilter;
    if (mode === "all") return "All Time";
    if (mode === "year") return `Year ${date.getFullYear()}`;
    if (mode === "quarter") {
      const q = Math.floor(date.getMonth() / 3) + 1;
      return `Q${q} ${date.getFullYear()}`;
    }
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };

  const formatAmount = (num: number) => {
    return Number(num).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className={css.historyCard}>
      <div className={css.header}>
        <div className={css.titleCluster}>
          <h3 className={css.title}>Transaction History</h3>
          <span className={css.counterBadge}>
            ({transactions.length} record{transactions.length === 1 ? "" : "s"})
          </span>
        </div>

        <div className={css.monthNavigator}>
          {periodFilter.mode === "month" && (
            <button
              type="button"
              className={css.navArrowBtn}
              onClick={onPrevMonth}
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}

          <div className={css.dropdownWrapper} ref={dropdownRef}>
            <button
              type="button"
              className={clsx(css.periodSelectBtn, isOpen && css.active)}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <span>{getPeriodLabel()}</span>
            </button>

            {isOpen && (
              <div className={css.dropdownMenu}>
                <button
                  type="button"
                  className={clsx(
                    css.menuItem,
                    periodFilter.mode === "month" && css.selectedItem,
                  )}
                  onClick={() => {
                    onSelectMode("month");
                    setIsOpen(false);
                  }}
                >
                  Current Month
                </button>
                <button
                  type="button"
                  className={clsx(
                    css.menuItem,
                    periodFilter.mode === "quarter" && css.selectedItem,
                  )}
                  onClick={() => {
                    onSelectMode("quarter");
                    setIsOpen(false);
                  }}
                >
                  Current Quarter
                </button>
                <button
                  type="button"
                  className={clsx(
                    css.menuItem,
                    periodFilter.mode === "year" && css.selectedItem,
                  )}
                  onClick={() => {
                    onSelectMode("year");
                    setIsOpen(false);
                  }}
                >
                  This Year
                </button>
                <button
                  type="button"
                  className={clsx(
                    css.menuItem,
                    periodFilter.mode === "all" && css.selectedItem,
                  )}
                  onClick={() => {
                    onSelectMode("all");
                    setIsOpen(false);
                  }}
                >
                  All Time
                </button>
              </div>
            )}
          </div>

          {periodFilter.mode === "month" && (
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

      <div className={css.list}>
        {transactions.length === 0 ? (
          <div className={css.emptyState}>
            No transactions found for {getPeriodLabel().toLowerCase()}.
          </div>
        ) : (
          transactions.map((tx) => {
            const isIncome = tx.type === "income";

            return (
              <div key={tx.id} className={css.row}>
                <span className={css.dateCol}>{formatDate(tx.date)}</span>

                <span className={css.descriptionCol} title={tx.description}>
                  {tx.description}
                </span>

                <div className={css.categoryCol}>
                  <span
                    className={clsx(css.categoryBadge, {
                      [css.categoryIncome]: isIncome,
                    })}
                  >
                    {tx.category || (isIncome ? "Income" : "General")}
                  </span>
                </div>

                <div className={css.amountCol}>
                  <span
                    className={clsx(css.amountValue, {
                      [css.amountIncome]: isIncome,
                      [css.amountExpense]: !isIncome,
                    })}
                  >
                    {isIncome ? "+" : "-"}
                    {formatAmount(tx.amount)} {currency}
                  </span>

                  {onDelete && (
                    <button
                      type="button"
                      className={css.deleteBtn}
                      onClick={() => onDelete(tx.id)}
                      title="Delete transaction"
                      aria-label="Delete transaction"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
