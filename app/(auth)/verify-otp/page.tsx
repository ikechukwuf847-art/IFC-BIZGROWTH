import { Suspense } from "react";
import VerifyOtpForm from "./verify-otp-form";

function VerifyOtpLoading() {
  return (
    <main className="auth-page">
      <section className="auth-section">
        <div className="otp-container">
          <div className="auth-card otp-card">
            <div className="auth-card-header">
              <h2>Verify your email</h2>
              <p>Loading verification...</p>
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

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpLoading />}>
      <VerifyOtpForm />
    </Suspense>
  );
}
