import Link from "next/link";

export default function AccountDeletedPage() {
return (
<main className="deleted-page">
<section className="deleted-card">
<div className="deleted-icon" aria-hidden="true">
✓
</div>

    <p className="deleted-eyebrow">IFC BIZGROWTH</p>

    <h1>Account deletion completed</h1>

    <p className="deleted-description">
      Your account deletion request has been processed successfully.
      You can no longer sign in using the deleted account.
    </p>

    <div className="deleted-notice">
      <strong>Important information</strong>
      <p>
        Certain financial, transaction, or legally required records may
        be retained where applicable. Any remaining personal information
        will be handled according to our privacy policy and applicable
        legal requirements.
      </p>
    </div>

    <Link href="/" className="deleted-home-button">
      Return to IFC BIZGROWTH
    </Link>

    <p className="deleted-support">
      Need assistance? Contact{" "}
      <a href="mailto:contactus@ifcbridgelab.com">
        contactus@ifcbridgelab.com
      </a>
    </p>
  </section>

  <style>{`
    .deleted-page {
      min-height: 100vh;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      background: #f4f7fb;
      color: #172033;
      font-family: inherit;
    }

    .deleted-card {
      box-sizing: border-box;
      width: 100%;
      max-width: 480px;
      padding: 36px 28px;
      border: 1px solid #e5eaf2;
      border-radius: 20px;
      background: #ffffff;
      text-align: center;
      box-shadow: 0 18px 55px rgba(20, 42, 80, 0.08);
    }

    .deleted-icon {
      display: grid;
      width: 64px;
      height: 64px;
      place-items: center;
      margin: 0 auto 22px;
      border-radius: 50%;
      background: #e8f8ef;
      color: #16804a;
      font-size: 32px;
      font-weight: 800;
    }

    .deleted-eyebrow {
      margin: 0 0 10px;
      color: #1769e0;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
    }

    .deleted-card h1 {
      margin: 0 0 14px;
      font-size: 29px;
      line-height: 1.25;
    }

    .deleted-description {
      margin: 0;
      color: #667085;
      font-size: 14px;
      line-height: 1.8;
    }

    .deleted-notice {
      margin: 24px 0;
      padding: 16px;
      border: 1px solid #dce7f8;
      border-radius: 12px;
      background: #f7faff;
      text-align: left;
    }

    .deleted-notice strong {
      color: #344054;
      font-size: 13px;
    }

    .deleted-notice p {
      margin: 8px 0 0;
      color: #667085;
      font-size: 12px;
      line-height: 1.8;
    }

    .deleted-home-button {
      display: block;
      padding: 14px 18px;
      border-radius: 10px;
      background: #1769e0;
      color: #ffffff;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
    }

    .deleted-support {
      margin: 22px 0 0;
      color: #667085;
      font-size: 12px;
      line-height: 1.8;
      overflow-wrap: anywhere;
    }

    .deleted-support a {
      color: #1769e0;
      text-decoration: none;
    }

    @media (max-width: 480px) {
      .deleted-card {
        padding: 28px 20px;
      }

      .deleted-card h1 {
        font-size: 25px;
      }
    }
  `}</style>
</main>

);
  }
