import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import css from "./transactionForm.module.css";

interface TransactionPayload {
  type: "expense" | "income";
  date: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
}

interface TransactionFormProps {
  currency?: string;
  onAdd: (payload: TransactionPayload) => void;
  onOpenCategoryModal?: () => void;
}

const EXPENSE_CATEGORIES = [
  "Groceries",
  "Transport",
  "Utilities",
  "Healthcare",
  "Leisure",
];

const INCOME_CATEGORIES = ["Salary", "Freelance", "Investments", "Gifts"];

export default function TransactionForm({
  currency = "UAH",
  onAdd,
  onOpenCategoryModal,
}: TransactionFormProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [amount, setAmount] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  const activeCategories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Закриття меню при кліку за його межами
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };

    if (isCategoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryOpen]);

  const handleTypeChange = (newType: "expense" | "income") => {
    setType(newType);
    setCategory(
      newType === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0],
    );
  };

  const handleOpenCalendar = () => {
    if (dateInputRef.current) {
      if ("showPicker" in HTMLInputElement.prototype) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleClear = () => {
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategory(
      type === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0],
    );
    setIsCategoryOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(",", "."));

    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAdd({
      type,
      date,
      description: description.trim() || category,
      category,
      amount: parsedAmount,
      currency,
    });

    handleClear();
  };

  return (
    <div className={css.transactionCard}>
      <form className={css.form} onSubmit={handleSubmit}>
        <div className={css.inputCluster}>
          <div className={css.row}>
            <div
              className={clsx(css.typeToggle, {
                [css.incomeActive]: type === "income",
              })}
            >
              <button
                type="button"
                className={clsx(
                  css.toggleBtn,
                  type === "expense" && css.active,
                )}
                onClick={() => handleTypeChange("expense")}
              >
                Expenses
              </button>
              <button
                type="button"
                className={clsx(css.toggleBtn, type === "income" && css.active)}
                onClick={() => handleTypeChange("income")}
              >
                Income
              </button>
            </div>

            <div className={css.dateField} onClick={handleOpenCalendar}>
              <span className={clsx("material-symbols-outlined", css.dateIcon)}>
                calendar_today
              </span>
              <input
                ref={dateInputRef}
                type="date"
                className={css.dateNativeInput}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className={css.descriptionField}>
              <input
                type="text"
                className={css.textInput}
                placeholder="Description (e.g. Supermarket)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className={css.row}>
            <div
              className={clsx(css.categorySelector, isCategoryOpen && css.open)}
              ref={categoryRef}
            >
              <button
                type="button"
                className={css.categoryTrigger}
                onClick={() => setIsCategoryOpen((prev) => !prev)}
              >
                <span className={css.selectedCategoryLabel}>{category}</span>
                <span
                  className={clsx(
                    "material-symbols-outlined",
                    css.dropdownChevron,
                  )}
                >
                  expand_more
                </span>
              </button>

              {isCategoryOpen && (
                <div className={css.categoryDropdown}>
                  <div className={css.categoryList}>
                    {activeCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={clsx(
                          css.categoryItem,
                          category === cat && css.selectedCategory,
                        )}
                        onClick={() => {
                          setCategory(cat);
                          setIsCategoryOpen(false);
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className={css.addCategoryDivider} />

                  <button
                    type="button"
                    className={css.addCategoryBtn}
                    onClick={() => {
                      setIsCategoryOpen(false);
                      onOpenCategoryModal?.();
                    }}
                  >
                    <span className="material-symbols-outlined">add</span>
                    <span>Add custom category...</span>
                  </button>
                </div>
              )}
            </div>

            <div className={css.amountField}>
              <input
                type="text"
                inputMode="decimal"
                className={css.amountInput}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className={css.currencyBadge}>{currency}</span>
            </div>
          </div>
        </div>

        <div className={css.divider} />

        <div className={css.actionGroup}>
          <button type="submit" className={css.submitBtn}>
            Add
          </button>
          <button type="button" className={css.clearBtn} onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
