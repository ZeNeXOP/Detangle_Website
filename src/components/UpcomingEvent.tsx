import { useEffect, useState } from "react";
import type { Event } from "../types";
import { formatEventEyebrow } from "../lib/formatEventDate";

function EventCard({ event, compact }: { event: Event; compact: boolean }) {
  return (
    <div className={compact ? "event-card" : "event-inner"}>
      <div className={compact ? "event-card-poster-slot" : "event-poster-slot"}>
        <div className={compact ? "event-card-poster-placeholder" : "event-poster-placeholder"}>
          {event.poster_url && (
            <img
              src={event.poster_url}
              alt={`${event.title} poster`}
              className={compact ? "event-card-poster-image" : "event-poster-image"}
            />
          )}
        </div>
      </div>

      <div className={compact ? "event-card-details" : "event-details"}>
        {formatEventEyebrow(event) && (
          <p className={compact ? "event-card-eyebrow" : "event-eyebrow"}>{formatEventEyebrow(event)}</p>
        )}

        <h2 className={compact ? "event-card-title" : "event-title"}>{event.title}</h2>

        <p className={compact ? "event-card-subhead" : "event-subhead"}>{event.description}</p>

        {event.location && (
          <p className={compact ? "event-card-location" : "event-subhead"}>{event.location}</p>
        )}

        {typeof event.price === "number" && (
          <div className="event-meta">
            <span className={compact ? "event-card-price" : "event-price"}>
              ₹{event.price}
              <span className="event-price-sub"> per person</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UpcomingEvent() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/events?status=upcoming")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Event[]) => {
        if (!cancelled) {
          setUpcomingEvents(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUpcomingEvents([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!upcomingEvents || upcomingEvents.length === 0) {
    return null;
  }

  if (upcomingEvents.length === 1) {
    return (
      <section className="event-section">
        <EventCard event={upcomingEvents[0]} compact={false} />
      </section>
    );
  }

  return (
    <section className="event-section event-section--dual">
      <div className="event-dual-grid">
        {upcomingEvents.map((event) => (
          <EventCard key={event.id} event={event} compact />
        ))}
      </div>
    </section>
  );
}
