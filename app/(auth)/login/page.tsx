import { Suspense } from "react";
import LoginForm from "./login-form";

function LoginLoading() {
  return (
    <main className="auth-page">
      <section className="auth-section">
        <div className="auth-container">
          <div className="auth-card login-card">
            <div className="auth-card-header">
              <div className="auth-brand">
                IFC <span>BIZGROWTH</span>
              </div>

              <div className="auth-heading">
                <h1>Welcome back</h1>
                <p>Loading your login page...</p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "30px 0",
              }}
            >
              <span className="auth-spinner" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
