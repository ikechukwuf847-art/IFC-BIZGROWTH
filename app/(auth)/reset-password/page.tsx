import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

function ResetPasswordLoading() {
  return (
    <main className="auth-page">
      <section className="auth-section">
        <div className="auth-container">
          <div className="auth-card reset-password-card">
            <div className="auth-card-header">
              <div className="auth-brand">
                IFC <span>BIZGROWTH</span>
              </div>

              <div className="auth-heading">
                <h1>Reset your password</h1>
                <p>Loading password reset...</p>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
              }
