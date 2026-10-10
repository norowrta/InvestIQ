import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { Transaction } from "../../dashboard/Dashboard";
import { CATEGORY_PALETTE, OTHER_PALETTE } from "./categoryConfig";
import css from "./donutChartCard.module.css";

interface DonutChartCardProps {
  transactions?: Transaction[];
  currency?: string;
  maxVisible?: number;
}

interface ChartSlice {
  name: string;
  amount: number;
  color: string;
}

export default function DonutChartCard({
  transactions = [],
  currency = "UAH",
  maxVisible = 5,
}: DonutChartCardProps) {
  const { chartData, totalSpent, totalCount, activeCategoriesCount } =
    useMemo(() => {
      const expenseMap = new Map<string, { total: number; count: number }>();
      let grandTotal = 0;
      let grandCount = 0;

      transactions.forEach((tx) => {
        if (tx.type !== "expense") return;
        const amount = Number(tx.amount) || 0;
        const catName = tx.category || "Other";

        grandTotal += amount;
        grandCount++;

        const curr = expenseMap.get(catName) || { total: 0, count: 0 };
        expenseMap.set(catName, {
          total: curr.total + amount,
          count: curr.count + 1,
        });
      });

      if (grandTotal === 0) {
        return {
          chartData: [],
          totalSpent: 0,
          totalCount: 0,
          activeCategoriesCount: 0,
        };
      }

      const sorted = Array.from(expenseMap.entries())
        .map(([name, data]) => ({
          name,
          amount: data.total,
          count: data.count,
        }))
        .sort((a, b) => b.amount - a.amount);

      let visible = sorted;
      let otherTotal = 0;

      if (sorted.length > maxVisible) {
        visible = sorted.slice(0, maxVisible - 1);
        otherTotal = sorted
          .slice(maxVisible - 1)
          .reduce((acc, curr) => acc + curr.amount, 0);
      }

      const data: ChartSlice[] = visible.map((item, index) => ({
        name: item.name,
        amount: item.amount,
        color: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length].color,
      }));

      if (otherTotal > 0) {
        data.push({
          name: "Other",
          amount: otherTotal,
          color: OTHER_PALETTE.color,
        });
      }

      return {
        chartData: data,
        totalSpent: grandTotal,
        totalCount: grandCount,
        activeCategoriesCount: expenseMap.size,
      };
    }, [transactions, maxVisible]);

  const displayData =
    chartData.length > 0
      ? chartData
      : [{ name: "No expenses", amount: 1, color: "#e2e8f0" }];

  return (
    <div className={css.donutChartCard}>
      <div className={css.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any) => [
                `${Number(value).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ${currency}`,
                name,
              ]}
              wrapperStyle={{ zIndex: 100, pointerEvents: "none" }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            />
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={78}
              outerRadius={114}
              paddingAngle={chartData.length > 1 ? 4 : 0}
              cornerRadius={8}
              dataKey="amount"
              stroke="none"
              animationDuration={800}
            >
              {displayData.map((entry, index) => (
                <Cell key={`donut-cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className={css.centerInfo}>
          <span className={css.centerLabel}>TOTAL SPENT</span>
          <span className={css.centerAmount}>
            {Math.round(totalSpent).toLocaleString("en-US")}
          </span>
          <span className={css.centerCurrency}>{currency}</span>
        </div>
      </div>

      <div className={css.footer}>
        <span>
          {`${activeCategoriesCount} ${
            activeCategoriesCount === 1
              ? "active spending category"
              : "active spending categories"
          }`}
        </span>
        <span className={css.footerDivider}>•</span>
        <span>
          {`${totalCount} ${
            totalCount === 1 ? "transaction total" : "transactions total"
          }`}
        </span>
      </div>
    </div>
  );
}
