import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/common/Shell.jsx";
import { api } from "../services/api.js";

export default function Charities() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/charities")
      .then((d) => setItems(d.charities))
      .catch((e) => setErr(e.message));
  }, []);

  const filtered = items.filter((c) =>
    `${c.name} ${c.description} ${c.category}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <Shell>
      <main className="section">
        <label>PURPOSE, IN ACTION</label>

        <h1>
          Choose a cause.
          <br />
          <i>Change a future.</i>
        </h1>

        <input
          className="search"
          placeholder="Search charities..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {err && <p className="error">{err}</p>}

        <div className="cards">
          {filtered.map((c, i) => (
            <Link
              key={c._id}
              to={`/charities/${c._id}`}
              className={`charity c${i % 3}`}
              style={{
                display: "block",
                color: "inherit",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <small>{c.category}</small>
              <h3>{c.name}</h3>
              <p>{c.description}</p>

              {c.upcomingEvents?.[0] && (
                <small>{c.upcomingEvents[0].title}</small>
              )}

              <p>View charity details →</p>
            </Link>
          ))}
        </div>

        {!filtered.length && !err && <p>No charities found.</p>}
      </main>
    </Shell>
  );
}
