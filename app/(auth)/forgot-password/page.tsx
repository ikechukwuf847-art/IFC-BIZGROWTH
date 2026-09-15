import { Suspense } from "react";
import ForgotPasswordForm from "./forgot-password-form";

function ForgotPasswordLoading() {
  return (
    <main className="auth-page">
      <section className="auth-section">
        <div className="auth-container">
          <div className="auth-card forgot-password-card">
            <div className="auth-card-header">
              <div className="auth-brand">
                IFC <span>BIZGROWTH</span>
              </div>

              <div className="auth-heading">
                <h1>Forgot your password?</h1>
                <p>Loading password recovery...</p>
              </div>
            </div>

            <div className="auth-loading-area">
              <span className="auth-spinner auth-spinner-blue" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordForm />
    </Suspense>
  );
  }
