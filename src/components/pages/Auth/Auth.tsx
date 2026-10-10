import { useState } from "react";
import { toast, Bounce } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import css from "./Auth.module.css";

import arrow from "../../../assets/icons/arrow.svg";
import { Check } from "lucide-react";

const authValidationSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .trim()
    .min(6, "The password must contain at least 6 characters")
    .required("Password is required"),
});

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: authValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (mode === "login") {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });

          if (error) throw error;

          if (data.session) {
            toast.success("Welcome back! Successfully logged in.", {
              transition: Bounce,
            });
            navigate("/", { replace: true });
            resetForm();
          }
        } else {
          const { data, error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
          });

          if (error) throw error;

          if (data.user && !data.session) {
            toast.info(
              "Account created! Please check your email to confirm registration.",
              {
                transition: Bounce,
              },
            );
            setMode("login");
            resetForm();
          }
        }
      } catch (err: any) {
        toast.error(err.message || "Authentication failed. Please try again.", {
          transition: Bounce,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in with Google.", {
        transition: Bounce,
      });
    }
  };

  const handleModeChange = (newMode: "login" | "register") => {
    setMode(newMode);
    formik.resetForm();
  };

  return (
    <div className={css.auth}>
      <div className="container">
        <div className={css.content}>
          <div className={css.logoBlock}>
            <h1 className={css.logo}>
              Invest <span className={css.logoPart}>IQ</span>
            </h1>
            <h3 className={css.subtitle}>SMART FINANCE</h3>
          </div>

          <div className={css.formBlock}>
            <div
              className={`${css.toggleContainer} ${mode === "register" ? css.registerActive : ""}`}
            >
              <button
                type="button"
                className={`${css.toggleBtn} ${
                  mode === "login" ? css.active : ""
                }`}
                onClick={() => handleModeChange("login")}
              >
                Log In
              </button>
              <button
                type="button"
                className={`${css.toggleBtn} ${
                  mode === "register" ? css.active : ""
                }`}
                onClick={() => handleModeChange("register")}
              >
                Register
              </button>
            </div>

            <button
              type="button"
              className={css.googleBtn}
              onClick={handleGoogleLogin}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className={css.googleIcon}
              />
              Sign in with Google
            </button>

            <div className={css.divider}>
              <span>or continue with email</span>
            </div>

            <form
              onSubmit={formik.handleSubmit}
              className={css.form}
              noValidate
            >
              <div className={css.inputGroup}>
                <label htmlFor="email" className={css.label}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${css.input} ${
                    formik.touched.email && formik.errors.email
                      ? css.inputError
                      : ""
                  }`}
                />
                <span
                  className={`${css.errorText} ${formik.touched.email && formik.errors.email ? css.visible : ""}`}
                >
                  {formik.errors.email || "\u00A0"}
                </span>
              </div>

              <div className={css.inputGroup}>
                <div className={css.passwordHeader}>
                  <label htmlFor="password" className={css.label}>
                    Password
                  </label>
                  {mode === "login" && (
                    <a href="#forgot" className={css.forgotLink}>
                      Forgot password?
                    </a>
                  )}
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${css.input} ${
                    formik.touched.password && formik.errors.password
                      ? css.inputError
                      : ""
                  }`}
                />
                <span
                  className={`${css.errorText} ${formik.touched.password && formik.errors.password ? css.visible : ""}`}
                >
                  {formik.errors.password || "\u00A0"}
                </span>
              </div>

              <div className={css.checkboxGroup}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  className={css.checkbox}
                />
                <label htmlFor="rememberMe" className={css.checkboxLabel}>
                  <span className={css.customCheckbox}>
                    <Check className={css.checkIcon} />
                  </span>
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className={css.submitBtn}
              >
                {formik.isSubmitting ? (
                  "Processing..."
                ) : mode === "login" ? (
                  <>
                    Log In <img src={arrow} className={css.arrow} />
                  </>
                ) : (
                  <>
                    Register <img src={arrow} className={css.arrow} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
