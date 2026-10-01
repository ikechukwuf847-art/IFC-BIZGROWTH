.advertising-page {
  min-height: 100vh;
  background: #f5f7fb;
  color: #111827;
  padding: 32px 24px 70px;
}

.advertising-shell {
  width: min(1240px, 100%);
  margin: 0 auto;
}

.advertising-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 28px;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 8px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.advertising-header h1 {
  margin: 0;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.advertising-header p {
  max-width: 650px;
  margin: 12px 0 0;
  color: #667085;
  font-size: 15px;
  line-height: 1.7;
}

.business-chip {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 190px;
  padding: 12px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 5px 20px rgba(15, 23, 42, 0.04);
}

.business-chip strong,
.business-chip small {
  display: block;
}

.business-chip strong {
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.business-chip small {
  margin-top: 3px;
  color: #667085;
  font-size: 11px;
}

.business-dot {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #16a34a;
  box-shadow: 0 0 0 5px #dcfce7;
}

.advertising-nav {
  display: flex;
  align-items: stretch;
  gap: 4px;
  padding: 5px;
  margin-bottom: 26px;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 5px 20px rgba(15, 23, 42, 0.04);
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 48px;
  flex: 1;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: #667085;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  transition: 0.2s ease;
}

.nav-item small {
  padding: 3px 8px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 10px;
}

.nav-item:hover {
  color: #111827;
  background: #f8fafc;
}

.nav-item.active {
  color: #fff;
  background: #2563eb;
}

.nav-item.active small {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.alert {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 17px;
  margin-bottom: 20px;
  border-radius: 12px;
  font-size: 13px;
}

.alert strong {
  margin-right: 4px;
}

.alert-error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.alert-success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}

.alert button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 20px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.section-heading.compact {
  margin-top: 42px;
}

.section-heading h2 {
  margin: 0;
  font-size: 22px;
  letter-spacing: -0.025em;
}

.section-heading p {
  margin: 6px 0 0;
  color: #667085;
  font-size: 13px;
}

.campaign-builder {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

.builder-card,
.checkout-card,
.stats-table-card,
.active-card,
.empty-card,
.info-box {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
}

.builder-card {
  padding: 25px;
}

.card-heading {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 22px;
}

.step-number {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
}

.card-heading h3 {
  margin: 0;
  font-size: 16px;
}

.card-heading p {
  margin: 4px 0 0;
  color: #667085;
  font-size: 12px;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.package-card {
  min-height: 145px;
  padding: 17px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  color: #111827;
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;
}

.package-card:hover {
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.package-card.selected {
  border: 2px solid #2563eb;
  background: #eff6ff;
}

.package-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #667085;
  font-size: 11px;
  font-weight: 700;
}

.package-card strong {
  display: block;
  margin-top: 25px;
  font-size: 17px;
  letter-spacing: -0.02em;
}

.package-card small {
  display: block;
  margin-top: 7px;
  color: #98a2b3;
  font-size: 10px;
  line-height: 1.4;
}

.check {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  font-size: 11px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.form-grid label {
  display: block;
}

.form-grid label > span {
  display: block;
  margin-bottom: 8px;
  color: #344054;
  font-size: 12px;
  font-weight: 700;
}

.form-grid input,
.form-grid select {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #d0d5dd;
  border-radius: 11px;
  outline: none;
  background: #fff;
  color: #111827;
  font: inherit;
  font-size: 13px;
  transition: 0.2s ease;
}

.form-grid input:focus,
.form-grid select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.checkout-card {
  display: grid;
  grid-template-columns: 1.4fr 0.7fr auto;
  align-items: center;
  gap: 25px;
  padding: 23px 25px;
}

.checkout-label {
  display: block;
  margin-bottom: 6px;
  color: #98a2b3;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.checkout-card h3 {
  margin: 0;
  font-size: 17px;
}

.checkout-card p {
  margin: 5px 0 0;
  color: #667085;
  font-size: 12px;
}

.checkout-price {
  text-align: right;
}

.checkout-price small {
  display: block;
  color: #98a2b3;
  font-size: 10px;
}

.checkout-price strong {
  display: block;
  margin-top: 5px;
  font-size: 22px;
}

.primary-button,
.secondary-button {
  min-height: 46px;
  padding: 0 20px;
  border-radius: 11px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 750;
  transition: 0.2s ease;
}

.primary-button {
  border: 0;
  background: #2563eb;
  color: #fff;
}

.primary-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.secondary-button {
  border: 1px solid #d0d5dd;
  background: #fff;
  color: #344054;
}

.secondary-button:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.secondary-button.full {
  width: 100%;
}

.secure-note {
  grid-column: 1 / -1;
  margin-top: -12px;
  color: #98a2b3;
  font-size: 10px;
}

.campaign-list {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
}

.campaign-row {
  display: grid;
  grid-template-columns: 1fr 180px 130px;
  align-items: center;
  gap: 20px;
  padding: 17px 20px;
  border-bottom: 1px solid #eef2f6;
}

.campaign-row:last-child {
  border-bottom: 0;
}

.campaign-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.campaign-icon,
.empty-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 11px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 10px;
  font-weight: 800;
}

.campaign-info h3 {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.campaign-info p {
  margin: 4px 0 0;
  color: #98a2b3;
  font-size: 11px;
  text-transform: capitalize;
}

.campaign-meta {
  text-align: right;
}

.campaign-meta strong,
.campaign-meta span {
  display: block;
}

.campaign-meta strong {
  font-size: 13px;
}

.campaign-meta span {
  margin-top: 4px;
  color: #98a2b3;
  font-size: 10px;
}

.status {
  justify-self: end;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 750;
  text-transform: capitalize;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-pending_payment {
  background: #fef3c7;
  color: #92400e;
}

.status-draft {
  background: #f1f5f9;
  color: #475569;
}

.status-paused {
  background: #fef3c7;
  color: #92400e;
}

.status-completed {
  background: #e0e7ff;
  color: #3730a3;
}

.status-cancelled,
.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.empty-card {
  padding: 50px 25px;
  text-align: center;
}

.empty-card.large {
  padding: 75px 25px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 15px;
}

.empty-card h3 {
  margin: 0;
  font-size: 16px;
}

.empty-card p {
  max-width: 480px;
  margin: 8px auto 20px;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}

.info-box {
  margin-top: 18px;
  padding: 17px 20px;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.info-box strong {
  color: #1d4ed8;
  font-size: 13px;
}

.info-box p {
  margin: 5px 0 0;
  color: #475569;
  font-size: 12px;
  line-height: 1.6;
}

.active-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.active-card {
  padding: 25px;
}

.active-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 9px;
  border-radius: 20px;
  background: #dcfce7;
  color: #166534;
  font-size: 10px;
  font-weight: 800;
}

.live-badge span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16a34a;
}

.active-package {
  color: #667085;
  font-size: 11px;
  font-weight: 700;
}

.active-card h3 {
  margin: 22px 0 7px;
  font-size: 20px;
}

.active-card > p {
  margin: 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}

.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 25px 0 15px;
}

.date-grid div {
  padding: 14px;
  border-radius: 12px;
  background: #f8fafc;
}

.date-grid small,
.date-grid strong {
  display: block;
}

.date-grid small {
  color: #98a2b3;
  font-size: 10px;
}

.date-grid strong {
  margin-top: 5px;
  font-size: 12px;
}

.active-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  margin-bottom: 15px;
  border-top: 1px solid #eef2f6;
  border-bottom: 1px solid #eef2f6;
}

.active-price small {
  color: #667085;
  font-size: 11px;
}

.active-price strong {
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
  margin-bottom: 18px;
}

.stat-card {
  padding: 21px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
}

.stat-card span,
.stat-card small {
  display: block;
}

.stat-card span {
  color: #667085;
  font-size: 11px;
  font-weight: 700;
}

.stat-card strong {
  display: block;
  margin: 13px 0 5px;
  font-size: 27px;
  letter-spacing: -0.04em;
}

.stat-card small {
  color: #98a2b3;
  font-size: 10px;
}

.stats-table-card {
  overflow: hidden;
}

.table-heading {
  padding: 20px 22px;
  border-bottom: 1px solid #eef2f6;
}

.table-heading h3 {
  margin: 0;
  font-size: 14px;
}

.table-heading p {
  margin: 5px 0 0;
  color: #98a2b3;
  font-size: 11px;
}

.stats-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.stats-table-wrap table {
  width: 100%;
  border-collapse: collapse;
  min-width: 650px;
}

.stats-table-wrap th,
.stats-table-wrap td {
  padding: 14px 20px;
  border-bottom: 1px solid #eef2f6;
  text-align: left;
  font-size: 12px;
}

.stats-table-wrap th {
  background: #f8fafc;
  color: #667085;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stats-table-wrap td {
  color: #344054;
}

.table-empty {
  padding: 45px 20px;
  text-align: center;
  color: #98a2b3;
  font-size: 12px;
}

.advertising-loading {
  display: grid;
  min-height: 70vh;
  place-items: center;
  align-content: center;
  gap: 13px;
  color: #667085;
  font-size: 13px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: advertising-spin 0.8s linear infinite;
}

@keyframes advertising-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1050px) {
  .package-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .checkout-card {
    grid-template-columns: 1fr 1fr;
  }

  .checkout-card .primary-button {
    grid-column: 1 / -1;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .advertising-page {
    padding: 20px 14px 45px;
  }

  .advertising-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .business-chip {
    width: 100%;
  }

  .advertising-nav {
    overflow-x: auto;
  }

  .nav-item {
    min-width: 130px;
  }

  .package-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-grid,
  .active-grid {
    grid-template-columns: 1fr;
  }

  .campaign-row {
    grid-template-columns: 1fr;
    gap: 13px;
  }

  .campaign-meta {
    text-align: left;
  }

  .status {
    justify-self: start;
  }

  .checkout-card {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .checkout-price {
    text-align: left;
  }

  .checkout-card .primary-button {
    grid-column: auto;
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .advertising-header h1 {
    font-size: 30px;
  }

  .builder-card,
  .active-card {
    padding: 18px;
  }

  .package-grid {
    grid-template-columns: 1fr;
  }

  .package-card {
    min-height: 120px;
  }

  .package-card strong {
    margin-top: 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .date-grid {
    grid-template-columns: 1fr;
  }
  }
