import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Shell from "../components/common/Shell.jsx";
import { api, setSession } from "../services/api.js";

export default function Auth({ signup = false }) {
  let nav = useNavigate(),
    [form, S] = useState({
      name: "",
      email: "",
      password: "",
      plan: "monthly",
      charityId: "",
      percentage: 10,
    }),
    [charities, C] = useState([]),
    [err, E] = useState(""),
    [busy, B] = useState(false);

  useEffect(() => {
    api("/charities")
      .then((d) => {
        C(d.charities);
        if (d.charities[0]) S((f) => ({ ...f, charityId: d.charities[0]._id }));
      })
      .catch(() => {});
  }, []);

  let change = (e) =>
    S({
      ...form,
      [e.target.name]:
        e.target.type === "range" ? +e.target.value : e.target.value,
    });

  async function submit(e) {
    e.preventDefault();
    B(true);
    E("");
    try {
      let d = await api(signup ? "/auth/register" : "/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSession(d);
      nav(d.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (x) {
      E(x.message);
    } finally {
      B(false);
    }
  }

  return (
    <Shell>
      <main className="auth">
        <div>
          <label>YOUR NEXT CHAPTER</label>
          <h1>{signup ? "Join the movement." : "Welcome back."}</h1>
          <p>Play with purpose. Make every round count.</p>
        </div>
        <form onSubmit={submit}>
          <label>{signup ? "CREATE ACCOUNT" : "MEMBER ACCESS"}</label>
          <h2>{signup ? "Get started" : "Log in"}</h2>
          {err && <p className="error">{err}</p>}
          {signup && (
            <label>
              Full name
              <input name="name" required value={form.name} onChange={change} />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={change}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              minLength="8"
              required
              value={form.password}
              onChange={change}
            />
          </label>
          {signup && (
            <>
              <label>
                Membership
                <select name="plan" value={form.plan} onChange={change}>
                  <option value="monthly">Monthly — ₹499</option>
                  <option value="yearly">Yearly — ₹4,999</option>
                </select>
              </label>
              <label>
                Charity
                <select
                  name="charityId"
                  value={form.charityId}
                  onChange={change}
                  required
                >
                  {charities.map((c) => (
                    <option value={c._id} key={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Charity contribution: {form.percentage}%
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  name="percentage"
                  value={form.percentage}
                  onChange={change}
                />
              </label>
            </>
          )}
          <button className="btn full" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account" : "Log in"} ↗
          </button>
          <p className="switch">
            {signup ? "Already a member?" : "New here?"}{" "}
            <Link to={signup ? "/login" : "/signup"}>
              {signup ? "Log in" : "Create account"}
            </Link>
          </p>
        </form>
      </main>
    </Shell>
  );
}
