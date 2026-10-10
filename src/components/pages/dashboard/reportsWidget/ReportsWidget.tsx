import clsx from "clsx";
import css from "./reportsWidget.module.css";
import { Link } from "react-router-dom";

export default function ReportsWidget() {
  return (
    <Link to="/reports" className={css.reportsCard}>
      <div className={css.reportsContent}>
        <div className={css.iconContainer}>
          <span
            className={clsx("material-symbols-outlined", css.monitoringIcon)}
          >
            monitoring
          </span>
        </div>
        <div className={css.reportsMeta}>
          <h3 className={css.reportsHeading}>View Reports</h3>
          <p className={css.reportsSubheading}>Analytics & charts</p>
        </div>
      </div>

      <span className={clsx("material-symbols-outlined", css.actionArrow)}>
        arrow_forward
      </span>
    </Link>
  );
}
