import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../supabaseClient";
import type { Transaction } from "../dashboard/Dashboard";
import ActionBar, { type ReportPeriod } from "./actionBar/ActionBar";
import StartCards from "./startCards/StartCards";
import CategoryBreakdown from "./categoryBreakdown/CategoryBreakdown";
import css from "./reports.module.css";

export default function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (!error && data) {
        setTransactions(data);
      }
      setIsLoading(false);
    };

    fetchTransactions();
  }, []);

  const handlePrevMonth = () => {
    setSelectedDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setSelectedDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const periodLabel = useMemo(() => {
    if (period === "month") {
      return selectedDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    if (period === "quarter") {
      const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
      return `Q${currentQuarter} ${new Date().getFullYear()}`;
    }
    if (period === "year") {
      return `Year ${new Date().getFullYear()}`;
    }
    return "All Time";
  }, [period, selectedDate]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const selYear = selectedDate.getFullYear();
    const selMonth = selectedDate.getMonth();

    return transactions.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      const year = txDate.getFullYear();
      const month = txDate.getMonth();

      if (period === "month") {
        return year === selYear && month === selMonth;
      }
      if (period === "quarter") {
        const curQ = Math.floor(now.getMonth() / 3);
        const txQ = Math.floor(month / 3);
        return year === now.getFullYear() && txQ === curQ;
      }
      if (period === "year") {
        return year === now.getFullYear();
      }
      return true;
    });
  }, [transactions, period, selectedDate]);

  return (
    <div className="container">
      <div className={css.reports}>
        <ActionBar currentPeriod={period} onPeriodChange={setPeriod} />

        {!isLoading && (
          <StartCards
            transactions={transactions}
            period={period}
            selectedDate={selectedDate}
            currency="UAH"
            monthlyTarget={20000}
          />
        )}

        <CategoryBreakdown
          transactions={filteredTransactions}
          period={period}
          periodLabel={periodLabel}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
      </div>
    </div>
  );
}
