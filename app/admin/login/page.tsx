"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./admin-login.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError || !data.user) {
        setError(
          loginError?.message || "Invalid email or password."
        );
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("id, is_active")
        .eq("id", data.user.id)
        .maybeSingle();

      if (adminError) {
        console.error(adminError);
        await supabase.auth.signOut();
        setError("Unable to verify administrator access.");
        return;
      }

      if (!admin) {
        await supabase.auth.signOut();
        setError("You do not have administrator access.");
        return;
      }

      if (!admin.is_active) {
        await supabase.auth.signOut();
        setError("This administrator account is inactive.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-login-logo">IFC</div>

          <div>
            <h1>IFC BIZGROWTH</h1>
            <p>Administration</p>
          </div>
        </div>

        <div className="admin-login-heading">
          <h2>Admin Login</h2>
          <p>Sign in to manage IFC BIZGROWTH.</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-login-field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="admin-login-footer">
          IFC BIZGROWTH Administration
        </p>
      </section>
    </main>
  );
    }
