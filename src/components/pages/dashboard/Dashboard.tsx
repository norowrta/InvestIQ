import { useEffect, useState, useMemo } from "react";
import { toast, Bounce } from "react-toastify";
import { supabase } from "../../../supabaseClient";
import BalanceCard from "./balanceCard/BalanceCard";
import ReportsWidget from "./reportsWidget/ReportsWidget";
import TransactionForm from "./transactionForm/TransactionForm";
import TransactionHistory from "./transactionHistory/TransactionHistory";
import MonthlySummary from "./monthlySummary/MonthlySummary";
// import AiInsight from "./AiInsight/AiInsight";
import css from "./dashboard.module.css";

export interface Transaction {
  id: number;
  type: "income" | "expense" | string;
  amount: number;
  description?: string;
  category?: string;
  date?: string;
}

export type PeriodMode = "month" | "quarter" | "year" | "all";

export interface PeriodFilter {
  date: Date;
  mode: PeriodMode;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrency] = useState<string>("UAH");

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
    date: new Date(),
    mode: "month",
  });

  useEffect(() => {
    async function loadDashboardData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", user.id)
        .single();

      if (profileData?.currency) {
        setCurrency(profileData.currency);
      }

      const { data: transData, error } = await supabase
        .from("transactions")
        .select("id, type, amount, description, category, date")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        toast.error(error.message || "Failed to load transactions.", {
          transition: Bounce,
        });
      } else if (transData) {
        setTransactions(transData as Transaction[]);
      }
    }

    loadDashboardData();
  }, []);

  const filteredTransactions = useMemo(() => {
    const targetYear = periodFilter.date.getFullYear();
    const targetMonth = periodFilter.date.getMonth();
    const currentQuarter = Math.floor(targetMonth / 3);

    return transactions.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();

      if (periodFilter.mode === "all") return true;
      if (periodFilter.mode === "year") return txYear === targetYear;
      if (periodFilter.mode === "quarter") {
        return (
          txYear === targetYear && Math.floor(txMonth / 3) === currentQuarter
        );
      }

      return txYear === targetYear && txMonth === targetMonth;
    });
  }, [transactions, periodFilter]);

  const income = filteredTransactions
    .filter((item) => item.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const expenses = filteredTransactions
    .filter((item) => item.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = income - expenses;

  const handleAddTransaction = async (payload: {
    type: "expense" | "income";
    date: string;
    description: string;
    category: string;
    amount: number;
    currency: string;
  }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            type: payload.type,
            amount: payload.amount,
            description: payload.description,
            category: payload.category,
            date: payload.date,
          },
        ])
        .select("id, type, amount, description, category, date")
        .single();

      if (error) {
        toast.error(error.message || "Failed to add transaction.", {
          transition: Bounce,
        });
        return;
      }

      if (data) {
        setTransactions((prev) => [data as Transaction, ...prev]);
        toast.success("Transaction added successfully!", {
          transition: Bounce,
        });
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.", {
        transition: Bounce,
      });
    }
  };

  const handlePrevMonth = () => {
    setPeriodFilter((prev) => ({
      ...prev,
      date: new Date(prev.date.getFullYear(), prev.date.getMonth() - 1, 1),
      mode: "month",
    }));
  };

  const handleNextMonth = () => {
    setPeriodFilter((prev) => ({
      ...prev,
      date: new Date(prev.date.getFullYear(), prev.date.getMonth() + 1, 1),
      mode: "month",
    }));
  };

  const handleSelectMode = (mode: PeriodMode) => {
    setPeriodFilter((prev) => ({
      ...prev,
      mode,
      ...(mode === "month" ? { date: new Date() } : {}),
    }));
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("The transaction could not be deleted.", {
          transition: Bounce,
        });
        return;
      }

      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      toast.success("The transaction has been deleted!", {
        transition: Bounce,
      });
    } catch {
      toast.error("An error occurred during deletion.", { transition: Bounce });
    }
  };

  return (
    <div className={css.dashboard}>
      <div className="container">
        <div className={css.content}>
          <section className={css.topRow}>
            <BalanceCard
              balance={balance}
              income={income}
              expenses={expenses}
              currency={currency}
            />
            <ReportsWidget />
          </section>

          <div className={css.bottomRow}>
            <div className={css.transactionsContainer}>
              <TransactionForm
                currency={currency}
                onAdd={handleAddTransaction}
              />
              <TransactionHistory
                transactions={filteredTransactions}
                currency={currency}
                periodFilter={periodFilter}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onSelectMode={handleSelectMode}
                onDelete={handleDeleteTransaction}
              />
            </div>

            <div className={css.rightColumn}>
              <MonthlySummary
                transactions={transactions}
                currency={currency}
                year={periodFilter.date.getFullYear()}
              />
              {/* <AiInsight /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
