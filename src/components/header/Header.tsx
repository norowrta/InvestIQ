import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../supabaseClient";
import css from "./header.module.css";

export default function Header() {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <header className={css.header}>
      <div className="container">
        <div className={css.content}>
          <button className={css.logoBtn}>
            Invest <span className={css.logoPart}>IQ</span>
          </button>

          {session ? (
            <div className={css.userMenu}>
              <button className={css.userMenuBtns}>
                <span
                  className={`material-symbols-outlined ${css.icons} ${css.iconUser}`}
                >
                  person
                </span>
              </button>

              <span className={css.userMenuDivider}></span>

              <button className={css.userMenuBtns} onClick={handleLogout}>
                <span
                  className={`material-symbols-outlined ${css.icons} ${css.iconLogOut}`}
                >
                  logout
                </span>
              </button>
            </div>
          ) : (
            <div className={css.navbar}>
              <button className={css.navbarLink}>Product</button>
              <button className={css.navbarLink}>Security</button>
              <button className={css.navbarLink}>Help</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
