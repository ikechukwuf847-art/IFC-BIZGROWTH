"use client";

import { useMemo, useState } from "react";

type Business = {
  id: string;
  name: string;
};

type AnalyticsEvent = {
  id: number;
  business_id: string;
  event_type: string;
  visitor_id: string | null;
  session_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type Props = {
  business: Business;
  events: AnalyticsEvent[];
};

type Range = "7" | "30";

function normalizeEventType(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function isProfileView(eventType: string) {
  return [
    "profile_view",
    "business_view",
    "business_profile_view",
    "view_business",
    "view_profile",
  ].includes(normalizeEventType(eventType));
}

function isWebsiteClick(eventType: string) {
  return [
    "website_click",
    "website_view",
    "click_website",
  ].includes(normalizeEventType(eventType));
}

function isPhoneClick(eventType: string) {
  return [
    "phone_click",
    "call_click",
    "contact_phone",
    "phone_view",
  ].includes(normalizeEventType(eventType));
}

function isWhatsappClick(eventType: string) {
  return [
    "whatsapp_click",
    "whatsapp_view",
    "contact_whatsapp",
  ].includes(normalizeEventType(eventType));
}

function isProductView(eventType: string) {
  return [
    "product_view",
    "view_product",
    "product_click",
  ].includes(normalizeEventType(eventType));
}

function isServiceView(eventType: string) {
  return [
    "service_view",
    "view_service",
    "service_click",
  ].includes(normalizeEventType(eventType));
}

function formatEventName(eventType: string) {
  return eventType
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function AnalyticsWorkspace({
  business,
  events,
}: Props) {
  const [range, setRange] = useState<Range>("7");

  const filteredEvents = useMemo(() => {
    const days = Number(range);
    const cutoff = new Date();

    cutoff.setDate(cutoff.getDate() - days);

    return events.filter(
      (event) => new Date(event.created_at) >= cutoff,
    );
  }, [events, range]);

  const metrics = useMemo(() => {
    const profileViews = filteredEvents.filter((event) =>
      isProfileView(event.event_type),
    ).length;

    const websiteClicks = filteredEvents.filter((event) =>
      isWebsiteClick(event.event_type),
    ).length;

    const phoneClicks = filteredEvents.filter((event) =>
      isPhoneClick(event.event_type),
    ).length;

    const whatsappClicks = filteredEvents.filter((event) =>
      isWhatsappClick(event.event_type),
    ).length;

    const productViews = filteredEvents.filter((event) =>
      isProductView(event.event_type),
    ).length;

    const serviceViews = filteredEvents.filter((event) =>
      isServiceView(event.event_type),
    ).length;

    const uniqueVisitors = new Set(
      filteredEvents
        .map((event) => event.visitor_id)
        .filter(Boolean),
    ).size;

    const uniqueSessions = new Set(
      filteredEvents
        .map((event) => event.session_id)
        .filter(Boolean),
    ).size;

    const contactInteractions =
      websiteClicks +
      phoneClicks +
      whatsappClicks;

    return {
      profileViews,
      websiteClicks,
      phoneClicks,
      whatsappClicks,
      productViews,
      serviceViews,
      uniqueVisitors,
      uniqueSessions,
      contactInteractions,
      totalEvents: filteredEvents.length,
    };
  }, [filteredEvents]);

  const dailyActivity = useMemo(() => {
    const days = Number(range);
    const today = new Date();

    return Array.from({ length: days }, (_, index) => {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - (days - 1 - index));

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const count = filteredEvents.filter((event) => {
        const eventDate = new Date(event.created_at);

        return eventDate >= date && eventDate < nextDate;
      }).length;

      return {
        date,
        count,
      };
    });
  }, [filteredEvents, range]);

  const maxDailyActivity = Math.max(
    ...dailyActivity.map((day) => day.count),
    1,
  );

  const eventBreakdown = useMemo(() => {
    const counts = new Map<string, number>();

    filteredEvents.forEach((event) => {
      const name = formatEventName(event.event_type);

      counts.set(name, (counts.get(name) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredEvents]);

  return (
    <main className="analytics-page">
      <section className="analytics-hero">
        <div>
          <span className="analytics-eyebrow">
            BUSINESS ANALYTICS
          </span>

          <h1>Understand how people interact with your business.</h1>

          <p>
            See your business activity, customer interactions and
            recent engagement in one place.
          </p>
        </div>

        <div className="analytics-range">
          <span>View</span>

          <div className="analytics-range-buttons">
            <button
              type="button"
              className={range === "7" ? "active" : ""}
              onClick={() => setRange("7")}
            >
              7 days
            </button>

            <button
              type="button"
              className={range === "30" ? "active" : ""}
              onClick={() => setRange("30")}
            >
              30 days
            </button>
          </div>
        </div>
      </section>

      <section className="analytics-business-card">
        <div className="analytics-business-icon">
          {business.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <span>Your business</span>
          <strong>{business.name}</strong>
        </div>
      </section>

      <section className="analytics-metrics">
        <article className="analytics-metric-card">
          <span className="metric-icon">◉</span>
          <span className="metric-label">Profile views</span>
          <strong>{metrics.profileViews.toLocaleString()}</strong>
          <small>People viewing your business</small>
        </article>

        <article className="analytics-metric-card">
          <span className="metric-icon">↗</span>
          <span className="metric-label">Total activity</span>
          <strong>{metrics.totalEvents.toLocaleString()}</strong>
          <small>Tracked interactions</small>
        </article>

        <article className="analytics-metric-card">
          <span className="metric-icon">●</span>
          <span className="metric-label">Unique visitors</span>
          <strong>{metrics.uniqueVisitors.toLocaleString()}</strong>
          <small>Recognized visitors</small>
        </article>

        <article className="analytics-metric-card">
          <span className="metric-icon">◆</span>
          <span className="metric-label">Contact actions</span>
          <strong>
            {metrics.contactInteractions.toLocaleString()}
          </strong>
          <small>Website, phone and WhatsApp</small>
        </article>
      </section>

      <section className="analytics-main-grid">
        <article className="analytics-panel analytics-activity-panel">
          <div className="analytics-panel-heading">
            <div>
              <span className="analytics-panel-kicker">
                ACTIVITY
              </span>
              <h2>Business activity</h2>
            </div>

            <span className="analytics-panel-period">
              Last {range} days
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="analytics-empty">
              <div className="analytics-empty-icon">◌</div>
              <h3>No activity yet</h3>
              <p>
                Customer activity will appear here as people
                interact with your business.
              </p>
            </div>
          ) : (
            <div className="activity-chart">
              {dailyActivity.map((day) => {
                const height =
                  day.count === 0
                    ? 4
                    : Math.max(
                        10,
                        (day.count / maxDailyActivity) * 100,
                      );

                return (
                  <div
                    className="activity-column"
                    key={day.date.toISOString()}
                  >
                    <span className="activity-value">
                      {day.count}
                    </span>

                    <div className="activity-bar-area">
                      <div
                        className="activity-bar"
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    <span className="activity-date">
                      {day.date.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <span className="analytics-panel-kicker">
                ENGAGEMENT
              </span>
              <h2>Customer actions</h2>
            </div>
          </div>

          <div className="analytics-action-list">
            <div className="analytics-action-row">
              <div>
                <strong>Website</strong>
                <span>Website clicks</span>
              </div>
              <b>{metrics.websiteClicks}</b>
            </div>

            <div className="analytics-action-row">
              <div>
                <strong>Phone</strong>
                <span>Phone interactions</span>
              </div>
              <b>{metrics.phoneClicks}</b>
            </div>

            <div className="analytics-action-row">
              <div>
                <strong>WhatsApp</strong>
                <span>WhatsApp interactions</span>
              </div>
              <b>{metrics.whatsappClicks}</b>
            </div>

            <div className="analytics-action-row">
              <div>
                <strong>Products</strong>
                <span>Product views</span>
              </div>
              <b>{metrics.productViews}</b>
            </div>

            <div className="analytics-action-row">
              <div>
                <strong>Services</strong>
                <span>Service views</span>
              </div>
              <b>{metrics.serviceViews}</b>
            </div>
          </div>
        </article>
      </section>

      <section className="analytics-bottom-grid">
        <article className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <span className="analytics-panel-kicker">
                EVENTS
              </span>
              <h2>Activity breakdown</h2>
            </div>
          </div>

          {eventBreakdown.length === 0 ? (
            <div className="analytics-small-empty">
              No tracked events yet.
            </div>
          ) : (
            <div className="event-breakdown">
              {eventBreakdown.map((event) => {
                const percentage =
                  metrics.totalEvents > 0
                    ? (event.count / metrics.totalEvents) * 100
                    : 0;

                return (
                  <div
                    className="event-breakdown-row"
                    key={event.name}
                  >
                    <div className="event-breakdown-top">
                      <span>{event.name}</span>
                      <strong>{event.count}</strong>
                    </div>

                    <div className="event-breakdown-track">
                      <div
                        className="event-breakdown-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <span className="analytics-panel-kicker">
                VISITORS
              </span>
              <h2>Audience activity</h2>
            </div>
          </div>

          <div className="audience-summary">
            <div>
              <span>Unique visitors</span>
              <strong>{metrics.uniqueVisitors}</strong>
            </div>

            <div>
              <span>Sessions</span>
              <strong>{metrics.uniqueSessions}</strong>
            </div>

            <div>
              <span>Total events</span>
              <strong>{metrics.totalEvents}</strong>
            </div>
          </div>

          <p className="analytics-note">
            Visitor and session counts depend on the analytics
            events recorded for your public business pages.
          </p>
        </article>
      </section>

      <section className="analytics-panel analytics-recent-panel">
        <div className="analytics-panel-heading">
          <div>
            <span className="analytics-panel-kicker">
              RECENT ACTIVITY
            </span>
            <h2>Latest interactions</h2>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="analytics-empty">
            <div className="analytics-empty-icon">◌</div>
            <h3>Nothing to show yet</h3>
            <p>
              Your latest customer activity will appear here.
            </p>
          </div>
        ) : (
          <div className="recent-events">
            {filteredEvents.slice(0, 10).map((event) => (
              <div
                className="recent-event"
                key={event.id}
              >
                <div className="recent-event-icon">
                  ↗
                </div>

                <div className="recent-event-content">
                  <strong>
                    {formatEventName(event.event_type)}
                  </strong>

                  <span>
                    {formatDate(event.created_at)} at{" "}
                    {formatTime(event.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
