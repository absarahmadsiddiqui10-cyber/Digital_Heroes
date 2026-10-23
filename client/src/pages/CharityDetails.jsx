import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Shell from "../components/common/Shell.jsx";
import { api } from "../services/api.js";

export default function CharityDetails() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/charities")
      .then((d) => {
        const found = d.charities.find((c) => c._id === id);

        if (found) {
          setCharity(found);
        } else {
          setErr("Charity not found.");
        }
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Shell>
      <main className="section">
        <Link to="/charities">← Back to charities</Link>

        {loading && <p>Loading charity...</p>}

        {err && <p className="error">{err}</p>}

        {!loading && charity && (
          <>
            <label>{charity.category}</label>

            <h1>{charity.name}</h1>

            <p>{charity.description}</p>

            <section className="green">
              <label>MAKE AN IMPACT</label>
              <h2>
                Every contribution
                <br />
                <i>can make a difference.</i>
              </h2>

              <Link className="btn" to="/dashboard">
                Choose in dashboard →
              </Link>
            </section>

            <section>
              <label>UPCOMING EVENTS</label>
              <h2>What’s coming up</h2>

              {charity.upcomingEvents?.length ? (
                charity.upcomingEvents.map((event, i) => (
                  <article key={event._id || i}>
                    <h3>{event.title || "Charity event"}</h3>
                    {event.description && <p>{event.description}</p>}
                  </article>
                ))
              ) : (
                <p>No upcoming events listed yet.</p>
              )}
            </section>
          </>
        )}
      </main>
    </Shell>
  );
}
