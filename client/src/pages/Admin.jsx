import React, { useEffect, useState } from "react";
import Shell from "../components/common/Shell.jsx";
import { api } from "../services/api.js";
import { money } from "../utils/formatters.js";
import {
  Trophy,
  Sparkles,
  Play,
  CheckCircle2,
  Calendar,
  Layers,
  HeartHandshake,
  Plus,
  Pencil,
  Trash2,
  X,
  Building,
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  UserCheck,
  Shield,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function Admin() {
  const [overview, O] = useState(null);
  const [users, U] = useState([]);
  const [draws, D] = useState([]);
  const [charities, C] = useState([]);
  const [winners, W] = useState([]);
  const [err, E] = useState("");
  const [ok, K] = useState("");

  const [form, F] = useState({
    title: "Monthly Draw",
    drawDate: new Date().toISOString().slice(0, 10),
    mode: "random",
  });

  const [cf, CF] = useState({
    name: "",
    description: "",
    category: "Community impact",
  });

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [scoreForm, setScoreForm] = useState({
    value: "",
    date: "",
  });

  async function load() {
    try {
      const [o, u, d, c, w] = await Promise.all([
        api("/admin/overview"),
        api("/admin/users"),
        api("/admin/draws"),
        api("/admin/charities"),
        api("/admin/winners"),
      ]);

      O(o);
      U(u.users);
      D(d.draws);
      C(c.charities);
      W(w.winners);
      E("");
    } catch (e) {
      E(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function run(simulate) {
    try {
      E("");
      K("");

      const r = await api("/admin/draws/run", {
        method: "POST",
        body: JSON.stringify({ ...form, simulate }),
      });

      K(simulate ? "Simulation: " + r.numbers.join(", ") : "Draw published");

      await load();
    } catch (e) {
      E(e.message);
    }
  }

  async function completeDraw(id) {
    if (
      !window.confirm(
        "Complete this draw? Winning numbers will become visible to users.",
      )
    ) {
      return;
    }

    try {
      E("");
      K("");

      await api(`/admin/draws/${id}/complete`, {
        method: "PATCH",
        body: "{}",
      });

      K("Draw completed. Results are now available.");
      await load();
    } catch (e) {
      E(e.message);
    }
  }

  async function sub(id, status) {
    try {
      E("");
      K("");

      await api("/admin/users/" + id + "/subscription", {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      K("Membership status updated.");
      await load();
    } catch (e) {
      E(e.message);
    }
  }

  function resetCharityForm() {
    CF({
      name: "",
      description: "",
      category: "Community impact",
    });
    setEditingId(null);
  }

  async function add(e) {
    e.preventDefault();

    try {
      E("");
      K("");
      setSaving(true);

      await api("/admin/charities", {
        method: "POST",
        body: JSON.stringify(cf),
      });

      resetCharityForm();
      K("Charity added successfully.");
      await load();
    } catch (e) {
      E(e.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(charity) {
    setEditingId(charity._id);
    CF({
      name: charity.name || "",
      description: charity.description || "",
      category: charity.category || "Community impact",
    });
    E("");
    K("");
  }

  async function updateCharity(e) {
    e.preventDefault();
    if (!editingId) return;

    try {
      E("");
      K("");
      setSaving(true);

      await api(`/admin/charities/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(cf),
      });

      resetCharityForm();
      K("Charity updated successfully.");
      await load();
    } catch (e) {
      E(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCharity(charity) {
    if (
      !window.confirm(`Delete "${charity.name}"? This action cannot be undone.`)
    ) {
      return;
    }

    try {
      E("");
      K("");
      setDeletingId(charity._id);

      await api(`/admin/charities/${charity._id}`, {
        method: "DELETE",
      });

      if (editingId === charity._id) resetCharityForm();

      K("Charity deleted successfully.");
      await load();
    } catch (e) {
      E(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  function startEditUser(user) {
    setEditingUserId(user._id);
    setUserForm({
      name: user.name || "",
      email: user.email || "",
    });
    E("");
    K("");
  }

  async function saveUser(e) {
    e.preventDefault();
    if (!editingUserId) return;

    try {
      E("");
      K("");
      setSaving(true);

      await api(`/admin/users/${editingUserId}`, {
        method: "PATCH",
        body: JSON.stringify(userForm),
      });

      setEditingUserId(null);
      K("User profile updated successfully.");
      await load();
    } catch (e) {
      E(e.message);
    } finally {
      setSaving(false);
    }
  }

  function closeScores() {
    setSelectedUser(null);
    setScores([]);
    setEditingScoreId(null);
  }

  async function viewScores(user) {
    if (selectedUser && selectedUser._id === user._id) {
      closeScores();
      return;
    }

    setSelectedUser(user);
    setScores([]);
    setEditingScoreId(null);
    setLoadingScores(true);
    E("");
    K("");

    try {
      const result = await api(`/admin/users/${user._id}/scores`);
      setScores(result.scores || []);
    } catch (e) {
      E(e.message);
    } finally {
      setLoadingScores(false);
    }
  }

  function startEditScore(score) {
    setEditingScoreId(score._id);
    setScoreForm({
      value: String(score.value),
      date: new Date(score.date).toISOString().slice(0, 10),
    });
    E("");
    K("");
  }

  async function saveScore(e) {
    e.preventDefault();
    if (!selectedUser || !editingScoreId) return;

    try {
      E("");
      K("");
      setSaving(true);

      await api(`/admin/users/${selectedUser._id}/scores/${editingScoreId}`, {
        method: "PATCH",
        body: JSON.stringify({
          value: Number(scoreForm.value),
          date: scoreForm.date,
        }),
      });

      const result = await api(`/admin/users/${selectedUser._id}/scores`);

      setScores(result.scores || []);
      setEditingScoreId(null);
      K("Golf score updated successfully.");
    } catch (e) {
      E(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function review(id, verificationStatus) {
    try {
      E("");
      K("");

      await api(`/admin/winners/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ verificationStatus }),
      });

      K("Winner verification updated.");
      await load();
    } catch (e) {
      E(e.message);
    }
  }

  async function paid(id) {
    try {
      E("");
      K("");

      await api(`/admin/winners/${id}/payout`, {
        method: "PATCH",
        body: "{}",
      });

      K("Payout status updated.");
      await load();
    } catch (e) {
      E(e.message);
    }
  }

  if (!overview) {
    return (
      <Shell>
        <main className="section">
          <h1>Admin</h1>
          {err || "Loading admin console..."}
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="section">
        <label>PLATFORM CONTROL</label>
        <h1>
          Admin <i>console.</i>
        </h1>

        {err && <p className="error">{err}</p>}
        {ok && <p className="success">{ok}</p>}

        <div className="cards metrics">
          <article>
            <small>TOTAL USERS</small>
            <h2>{overview.totalUsers}</h2>
          </article>
          <article>
            <small>ACTIVE MEMBERSHIPS</small>
            <h2>{overview.activeSubscriptions}</h2>
          </article>
          <article>
            <small>PRIZE POOL ESTIMATE</small>
            <h2>{money(overview.prizePool)}</h2>
          </article>
          <article>
            <small>CHARITY CONTRIBUTIONS</small>
            <h2>{money(overview.charityContributions)}</h2>
          </article>
        </div>

        {/* ================= DRAW OPERATIONS SECTION (TAILWIND CSS) ================= */}
        <section className="my-10 pt-8 border-t border-[#e3e8de]">
          <div className="mb-6">
            <label className="inline-block text-[10px] tracking-[0.16em] font-bold text-[#739168] mb-1.5 uppercase">
              ● DRAW OPERATIONS
            </label>
            <h2 className="font-['Manrope'] text-2xl md:text-3xl font-bold text-[#1b2c22] mb-1.5 tracking-tight">
              Configure & Manage Draws
            </h2>
            <p className="text-xs md:text-sm text-[#728174] m-0">
              Simulate new rounds, publish live draws, and manage jackpot distributions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-6">
            {/* Left: Configure Draw Form */}
            <div className="lg:col-span-5 bg-white border border-[#e1e7dc] rounded-xl p-5 md:p-6 shadow-sm flex flex-col lg:h-[480px]">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#edf1eb] shrink-0">
                <h3 className="font-['Manrope'] text-base md:text-lg font-bold text-[#1b2c22] m-0 flex items-center gap-2">
                  <Trophy size={18} className="text-[#254a36]" /> Configure New Draw
                </h3>
                <span className="bg-[#edf3ea] text-[#254a36] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#dbe6d7]">
                  Mode: {form.mode}
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run(true);
                }}
                className="flex flex-col flex-1 justify-between"
              >
                <div className="space-y-3">
                  <label className="block text-[11px] font-semibold text-[#536454]">
                    Draw Title
                    <input
                      className="block w-full mt-1 px-3.5 py-2 border border-[#dce3d8] bg-[#fbfcf8] rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition"
                      value={form.title}
                      placeholder="e.g. Monthly Draw"
                      required
                      onChange={(e) => F({ ...form, title: e.target.value })}
                    />
                  </label>

                  <label className="block text-[11px] font-semibold text-[#536454]">
                    Scheduled Draw Date
                    <input
                      type="date"
                      required
                      className="block w-full mt-1 px-3.5 py-2 border border-[#dce3d8] bg-[#fbfcf8] rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition"
                      value={form.drawDate}
                      onChange={(e) => F({ ...form, drawDate: e.target.value })}
                    />
                  </label>

                  <label className="block text-[11px] font-semibold text-[#536454]">
                    Draw Generation Mode
                    <select
                      className="block w-full mt-1 px-3.5 py-2 border border-[#dce3d8] bg-[#fbfcf8] rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition cursor-pointer"
                      value={form.mode}
                      onChange={(e) => F({ ...form, mode: e.target.value })}
                    >
                      <option value="random">Random (Fair 5-number draw)</option>
                      <option value="weighted">
                        Score-frequency weighted (Demo fallback)
                      </option>
                    </select>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-4 mt-auto shrink-0">
                  <button
                    className="inline-flex items-center justify-center gap-1.5 bg-[#f1f5ee] hover:bg-[#e3ede0] text-[#254a36] border border-[#cbd8c4] rounded-md px-4 py-2.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    type="submit"
                    title="Simulate draw without publishing"
                  >
                    <Play size={14} /> Simulate
                  </button>

                  <button
                    type="button"
                    className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 bg-[#254a36] hover:bg-[#183b29] text-white border-0 rounded-md px-4 py-2.5 text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-50"
                    onClick={() => run(false)}
                    title="Publish live draw for members"
                  >
                    <Sparkles size={14} /> Publish Draw
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Existing Draws List */}
            <div className="lg:col-span-7 bg-white border border-[#e1e7dc] rounded-xl p-5 md:p-6 shadow-sm flex flex-col lg:h-[480px]">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#edf1eb] shrink-0">
                <h3 className="font-['Manrope'] text-base md:text-lg font-bold text-[#1b2c22] m-0 flex items-center gap-2">
                  <Layers size={18} className="text-[#254a36]" /> Draw History & Rounds
                </h3>
                <span className="bg-[#edf3ea] text-[#254a36] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#dbe6d7]">
                  {draws.length} Total
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto pr-2 focus:outline-none">
                {draws.length ? (
                  draws.map((x) => (
                    <div
                      key={x._id}
                      className="bg-[#fbfcf9] hover:bg-white border border-[#e5ebe0] hover:border-[#cbd8c4] rounded-lg p-4 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md"
                    >
                      <div className="flex justify-between items-start gap-2.5 mb-2.5">
                        <div>
                          <strong className="text-[15px] font-bold text-[#1b2c22] block">
                            {x.title}
                          </strong>
                          {x.drawDate && (
                            <small className="text-[#7a8a7c] inline-flex items-center gap-1 mt-1 text-xs">
                              <Calendar size={12} />
                              {new Date(x.drawDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </small>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            x.status === "completed"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : x.status === "published"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {x.status === "completed" && "✓ Completed"}
                          {x.status === "published" && "● Published (Live)"}
                          {x.status !== "completed" &&
                            x.status !== "published" &&
                            `● ${x.status}`}
                        </span>
                      </div>

                      {x.status === "completed" ? (
                        <div>
                          <small className="block font-bold text-[10px] tracking-wider text-[#728c68] mb-1.5 uppercase">
                            WINNING NUMBERS
                          </small>
                          <div className="flex flex-wrap gap-2">
                            {(x.numbers || []).map((num, i) => (
                              <span
                                key={i}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#254a36] to-[#153323] text-white inline-flex items-center justify-center font-bold text-xs shadow-md border-[1.5px] border-[#83a16c]"
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/50 border border-dashed border-emerald-200 rounded-md p-3 mt-1.5">
                          <p className="m-0 mb-2 text-xs text-[#5b6e5e]">
                            Round is live. Numbers are locked and hidden until
                            draw completion.
                          </p>

                          {x.status === "published" && (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 bg-[#254a36] hover:bg-[#183b29] text-white text-[11px] font-bold px-3.5 py-2 rounded transition cursor-pointer shadow-sm"
                              onClick={() => completeDraw(x._id)}
                            >
                              <CheckCircle2 size={13} /> Complete Draw & Match Winners
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#8a9689] py-6 text-xs md:text-sm">
                    No draws created yet. Use the form to configure and publish
                    your first draw.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= CHARITY DIRECTORY SECTION (TAILWIND CSS) ================= */}
        <section className="my-10 pt-8 border-t border-[#e3e8de]">
          <div className="mb-6">
            <label className="inline-block text-[10px] tracking-[0.16em] font-bold text-[#739168] mb-1.5 uppercase">
              ♡ CHARITY DIRECTORY
            </label>
            <h2 className="font-['Manrope'] text-2xl md:text-3xl font-bold text-[#1b2c22] mb-1.5 tracking-tight">
              Partner Charities & Impact Causes
            </h2>
            <p className="text-xs md:text-sm text-[#728174] m-0">
              Register verified non-profit organizations and manage their profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-6">
            {/* Left: Add / Edit Charity Form */}
            <div className="lg:col-span-5 bg-white border border-[#e1e7dc] rounded-xl p-5 md:p-6 shadow-sm flex flex-col lg:h-[520px]">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#edf1eb] shrink-0">
                <h3 className="font-['Manrope'] text-base md:text-lg font-bold text-[#1b2c22] m-0 flex items-center gap-2">
                  <HeartHandshake size={18} className="text-[#254a36]" />{" "}
                  {editingId ? "Edit Charity Profile" : "Register New Charity"}
                </h3>
                {editingId && (
                  <span className="text-[11px] bg-orange-50 text-orange-700 font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
                    Editing
                  </span>
                )}
              </div>

              {editingId && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 mb-3 flex items-center justify-between text-xs text-emerald-800 shrink-0">
                  <span>Updating: <b>{cf.name}</b></span>
                  <button
                    type="button"
                    onClick={resetCharityForm}
                    className="bg-transparent border-0 text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer underline text-[11px] p-0"
                  >
                    Cancel Edit
                  </button>
                </div>
              )}

              <form onSubmit={editingId ? updateCharity : add} className="flex flex-col flex-1 justify-between">
                <div className="space-y-3">
                  <label className="block text-[11px] font-semibold text-[#536454]">
                    Charity Name
                    <input
                      required
                      placeholder="e.g. Clean Water Collective"
                      className="block w-full mt-1 px-3.5 py-2 border border-[#dce3d8] bg-[#fbfcf8] rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition"
                      value={cf.name}
                      onChange={(e) => CF({ ...cf, name: e.target.value })}
                    />
                  </label>

                  <label className="block text-[11px] font-semibold text-[#536454]">
                    Impact Category
                    <input
                      required
                      placeholder="e.g. Community impact, Clean water, Education"
                      className="block w-full mt-1 px-3.5 py-2 border border-[#dce3d8] bg-[#fbfcf8] rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition"
                      value={cf.category}
                      onChange={(e) => CF({ ...cf, category: e.target.value })}
                    />
                  </label>

                  <label className="block text-[11px] font-semibold text-[#536454]">
                    Description & Mission
                    <textarea
                      required
                      rows="3"
                      placeholder="Provide a clear description of the charity's mission and programs..."
                      className="block w-full mt-1 px-3.5 py-2 border border-[#dce3d8] bg-[#fbfcf8] rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition resize-none h-20"
                      value={cf.description}
                      onChange={(e) => CF({ ...cf, description: e.target.value })}
                    />
                  </label>
                </div>

                <div className="flex gap-2.5 pt-4 mt-auto shrink-0">
                  <button
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#254a36] hover:bg-[#183b29] text-white border-0 rounded-md px-4 py-2.5 text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-50"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? (
                      "Saving..."
                    ) : editingId ? (
                      <>
                        <CheckCircle2 size={14} /> Save Changes
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Add Charity
                      </>
                    )}
                  </button>

                  {editingId && (
                    <button
                      className="inline-flex items-center justify-center gap-1.5 bg-[#f1f5ee] hover:bg-[#e3ede0] text-[#254a36] border border-[#cbd8c4] rounded-md px-4 py-2.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                      type="button"
                      onClick={resetCharityForm}
                      disabled={saving}
                    >
                      <X size={14} /> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Charities List */}
            <div className="lg:col-span-7 bg-white border border-[#e1e7dc] rounded-xl p-5 md:p-6 shadow-sm flex flex-col lg:h-[520px]">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#edf1eb] shrink-0">
                <h3 className="font-['Manrope'] text-base md:text-lg font-bold text-[#1b2c22] m-0 flex items-center gap-2">
                  <Building size={18} className="text-[#254a36]" /> Registered Charities
                </h3>
                <span className="bg-[#edf3ea] text-[#254a36] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#dbe6d7]">
                  {charities.length} Verified
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto pr-2 focus:outline-none">
                {charities.length ? (
                  charities.map((c) => (
                    <div
                      key={c._id}
                      className="bg-[#fbfcf9] hover:bg-white border border-[#e5ebe0] hover:border-[#cbd8c4] rounded-lg p-4 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md shrink-0"
                    >
                      <div className="flex justify-between items-start gap-2.5 mb-1.5">
                        <div>
                          <strong className="text-[15px] font-bold text-[#1b2c22] block">
                            {c.name}
                          </strong>
                          {c.category && (
                            <span className="inline-block text-[10px] font-bold tracking-wide text-[#254a36] bg-[#e8f2e4] border border-[#d2e4cb] px-2 py-0.5 rounded-md mt-1">
                              {c.category}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-1.5 shrink-0">
                          <button
                            className="inline-flex items-center gap-1 bg-[#f2f7ef] hover:bg-[#e1edd9] text-[#20402e] border border-[#cfe0cb] hover:border-[#b7ceb1] rounded px-2.5 py-1.5 text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                            type="button"
                            onClick={() => startEdit(c)}
                            disabled={saving || deletingId !== null}
                            title="Edit charity details"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 hover:border-red-300 rounded px-2.5 py-1.5 text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                            type="button"
                            onClick={() => deleteCharity(c)}
                            disabled={saving || deletingId !== null}
                            title="Delete charity"
                          >
                            <Trash2 size={12} />
                            {deletingId === c._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed text-[#607062] m-0 mt-1.5">
                        {c.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#8a9689] py-12 text-xs md:text-sm m-auto">
                    No charities registered yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= USER MANAGEMENT & SCORES SECTION ================= */}
        <section className="my-10 pt-8 border-t border-[#e3e8de]">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <label className="inline-block text-[10px] tracking-[0.16em] font-bold text-[#739168] mb-1.5 uppercase">
                ● MEMBER OPERATIONS
              </label>
              <h2 className="font-['Manrope'] text-2xl md:text-3xl font-bold text-[#1b2c22] mb-1.5 tracking-tight flex items-center gap-2">
                <Users size={26} className="text-[#254a36]" /> User Management
              </h2>
              <p className="text-xs md:text-sm text-[#728174] m-0">
                Manage member access, subscription statuses, and view or edit golf scores directly inline.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-[#dce3d8] rounded-full px-3.5 py-1 text-xs font-semibold text-[#254a36] shadow-sm self-start sm:self-auto">
              <UserCheck size={14} /> {users.length} Registered Members
            </div>
          </div>

          {editingUserId && (
            <div className="bg-white border-2 border-[#254a36]/20 rounded-xl p-5 mb-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#edf1eb]">
                <h3 className="font-['Manrope'] text-base font-bold text-[#1b2c22] m-0 flex items-center gap-2">
                  <Pencil size={16} className="text-[#254a36]" /> Edit Member Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingUserId(null)}
                  className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  title="Close edit form"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={saveUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-[11px] font-semibold text-[#536454]">
                    Full Name
                    <input
                      required
                      className="block w-full mt-1.5 px-3.5 py-2.5 border border-[#dce3d8] bg-[#fbfcf8] rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition"
                      value={userForm.name}
                      onChange={(e) =>
                        setUserForm({ ...userForm, name: e.target.value })
                      }
                    />
                  </label>

                  <label className="block text-[11px] font-semibold text-[#536454]">
                    Email Address
                    <input
                      required
                      type="email"
                      className="block w-full mt-1.5 px-3.5 py-2.5 border border-[#dce3d8] bg-[#fbfcf8] rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm({ ...userForm, email: e.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    className="inline-flex items-center justify-center gap-1.5 bg-[#254a36] hover:bg-[#183b29] text-white rounded-md px-4 py-2 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                    type="submit"
                    disabled={saving}
                  >
                    <CheckCircle2 size={14} /> {saving ? "Saving..." : "Save User"}
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-1.5 bg-[#f1f5ee] hover:bg-[#e3ede0] text-[#254a36] border border-[#cbd8c4] rounded-md px-4 py-2 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    type="button"
                    onClick={() => setEditingUserId(null)}
                    disabled={saving}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-[#e1e7dc] rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f7f9f5] text-[#5c6e5e] text-[11px] font-bold uppercase tracking-wider border-b border-[#e5ebe0]">
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Membership</th>
                    <th className="py-3.5 px-4">Set Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1ea]">
                  {users.map((u) => {
                    const isSelected = selectedUser && selectedUser._id === u._id;
                    const initial = (u.name || u.email || "U").charAt(0).toUpperCase();

                    return (
                      <React.Fragment key={u._id}>
                        <tr
                          className={`transition-colors ${
                            isSelected
                              ? "bg-[#f4f8f2]"
                              : "hover:bg-[#fafbf8]"
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-full bg-[#e8f1e5] text-[#254a36] font-bold text-xs flex items-center justify-center border border-[#d3e3cd] shrink-0">
                                {initial}
                              </span>
                              <span className="font-semibold text-[#1b2c22]">
                                {u.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[#607062]">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                u.role === "admin"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {u.role === "admin" && <Shield size={10} />}
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                u.subscriptionStatus === "active"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : u.subscriptionStatus === "cancelled"
                                    ? "bg-rose-50 text-rose-800 border-rose-200"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.subscriptionStatus === "active"
                                    ? "bg-emerald-500"
                                    : u.subscriptionStatus === "cancelled"
                                      ? "bg-rose-500"
                                      : "bg-slate-400"
                                }`}
                              />
                              {u.subscriptionStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={u.subscriptionStatus}
                              onChange={(e) => sub(u._id, e.target.value)}
                              className="px-2.5 py-1.5 bg-[#fbfcf8] border border-[#d5ded0] rounded-md text-xs font-medium text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] cursor-pointer"
                            >
                              <option value="inactive">inactive</option>
                              <option value="active">active</option>
                              <option value="cancelled">cancelled</option>
                              <option value="expired">expired</option>
                              <option value="pending">pending</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => startEditUser(u)}
                                className="inline-flex items-center gap-1 bg-[#f2f7ef] hover:bg-[#e1edd9] text-[#20402e] border border-[#cfe0cb] rounded px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer"
                                title="Edit user profile"
                              >
                                <Pencil size={12} /> Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => viewScores(u)}
                                className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition cursor-pointer shadow-sm ${
                                  isSelected
                                    ? "bg-[#254a36] text-white hover:bg-[#183b29]"
                                    : "bg-[#edf4ea] hover:bg-[#e1eedc] text-[#254a36] border border-[#cbdcc6]"
                                }`}
                                title="Toggle golf scores dropdown"
                              >
                                <Target size={13} />
                                {isSelected ? "Hide scores" : "View scores"}
                                {isSelected ? (
                                  <ChevronUp size={13} />
                                ) : (
                                  <ChevronDown size={13} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Inline Expandable Dropdown Row for Golf Scores */}
                        {isSelected && (
                          <tr className="bg-[#f7faf5] border-y-2 border-[#d6e3d2]">
                            <td colSpan={6} className="p-4 md:p-6">
                              <div className="bg-white border border-[#d7e3d3] rounded-xl p-5 shadow-sm">
                                {/* Dropdown Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-[#edf1eb] gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-[#254a36] text-white flex items-center justify-center font-bold shadow-sm">
                                      <Target size={17} />
                                    </div>
                                    <div>
                                      <h4 className="font-['Manrope'] text-base font-bold text-[#1b2c22] m-0">
                                        Golf Scores — {selectedUser.name}
                                      </h4>
                                      <small className="text-[#728274] text-xs">
                                        {selectedUser.email}
                                      </small>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <span className="text-[11px] font-bold bg-[#edf4ea] text-[#254a36] border border-[#d2e2ce] px-2.5 py-0.5 rounded-full">
                                      {scores.length} Rounds Logged
                                    </span>
                                    <button
                                      type="button"
                                      onClick={closeScores}
                                      className="inline-flex items-center gap-1 text-xs text-[#637565] hover:text-[#1b2c22] bg-[#f2f6f0] hover:bg-[#e5eee2] px-2.5 py-1 rounded-md transition cursor-pointer border border-[#dbe6d7]"
                                      title="Close scores dropdown"
                                    >
                                      <X size={13} /> Close
                                    </button>
                                  </div>
                                </div>

                                {/* Score Editor Form when editing a specific score */}
                                {editingScoreId && (
                                  <div className="bg-[#fbfcf9] border-2 border-[#254a36]/30 rounded-lg p-4 mb-5 shadow-sm">
                                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#e8eee6]">
                                      <span className="text-xs font-bold text-[#254a36] flex items-center gap-1.5 uppercase tracking-wide">
                                        <Pencil size={12} /> Edit Round Score
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setEditingScoreId(null)}
                                        className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>

                                    <form onSubmit={saveScore} className="flex flex-wrap items-end gap-3">
                                      <label className="block text-[11px] font-semibold text-[#536454] min-w-[140px] flex-1">
                                        Score (1–45)
                                        <input
                                          required
                                          type="number"
                                          min="1"
                                          max="45"
                                          value={scoreForm.value}
                                          onChange={(e) =>
                                            setScoreForm({
                                              ...scoreForm,
                                              value: e.target.value,
                                            })
                                          }
                                          className="block w-full mt-1 px-3 py-2 border border-[#dce3d8] bg-white rounded-md text-xs text-[#1b2c22] focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition"
                                        />
                                      </label>

                                      <label className="block text-[11px] font-semibold text-[#536454] min-w-[160px] flex-1">
                                        Date Played
                                        <input
                                          required
                                          type="date"
                                          value={scoreForm.date}
                                          onChange={(e) =>
                                            setScoreForm({
                                              ...scoreForm,
                                              date: e.target.value,
                                            })
                                          }
                                          className="block w-full mt-1 px-3 py-2 border border-[#dce3d8] bg-white rounded-md text-xs text-[#1b2c22] focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition"
                                        />
                                      </label>

                                      <div className="flex gap-2">
                                        <button
                                          type="submit"
                                          disabled={saving}
                                          className="inline-flex items-center gap-1 bg-[#254a36] hover:bg-[#183b29] text-white text-xs font-bold px-3.5 py-2 rounded-md transition cursor-pointer shadow-sm disabled:opacity-50"
                                        >
                                          <CheckCircle2 size={13} />
                                          {saving ? "Saving..." : "Save Score"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingScoreId(null)}
                                          disabled={saving}
                                          className="inline-flex items-center gap-1 bg-[#f1f5ee] hover:bg-[#e3ede0] text-[#254a36] text-xs font-semibold px-3 py-2 rounded-md border border-[#cbd8c4] transition cursor-pointer"
                                        >
                                          <X size={13} /> Cancel
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                )}

                                {/* Scores List / Scorecard Grid */}
                                {loadingScores ? (
                                  <div className="flex items-center justify-center py-8 gap-2 text-xs text-[#637565]">
                                    <Loader2 size={16} className="animate-spin text-[#254a36]" />
                                    Loading scores for {selectedUser.name}...
                                  </div>
                                ) : scores.length ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {scores.map((score) => {
                                      const isBeingEdited = editingScoreId === score._id;

                                      return (
                                        <div
                                          key={score._id}
                                          className={`border rounded-lg p-3 transition-all ${
                                            isBeingEdited
                                              ? "bg-[#eef5eb] border-[#254a36] shadow-sm ring-1 ring-[#254a36]/30"
                                              : "bg-[#fbfcf9] hover:bg-white border-[#e3ebe0] hover:border-[#cbd8c4] hover:shadow-sm"
                                          }`}
                                        >
                                          <div className="flex items-center justify-between pb-1.5 border-b border-[#edf2ea]">
                                            <span className="text-[10px] font-bold tracking-wider text-[#728c68] uppercase">
                                              ROUND
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => startEditScore(score)}
                                              className="p-1 text-[#627764] hover:text-[#254a36] hover:bg-[#edf4ea] rounded transition cursor-pointer"
                                              title="Edit this score"
                                            >
                                              <Pencil size={12} />
                                            </button>
                                          </div>

                                          <div className="my-2.5 flex items-baseline gap-1.5">
                                            <span className="text-2xl font-bold font-['Manrope'] text-[#1b2c22]">
                                              {score.value}
                                            </span>
                                            <span className="text-[10px] text-[#718471] font-semibold uppercase">
                                              pts
                                            </span>
                                          </div>

                                          <div className="text-[11px] text-[#6d7e6f] flex items-center gap-1.5 pt-2 border-t border-[#edf2ea]">
                                            <Calendar size={11} className="text-[#849a81]" />
                                            {new Date(score.date).toLocaleDateString("en-IN", {
                                              day: "numeric",
                                              month: "short",
                                              year: "numeric",
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-[#7f8f81] text-xs">
                                    <Target size={24} className="mx-auto mb-2 text-[#a3b5a1]" />
                                    No scores recorded for this user yet.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================= WINNER OPERATIONS SECTION ================= */}
        <section className="my-10 pt-8 border-t border-[#e3e8de]">
          <div className="mb-6">
            <label className="inline-block text-[10px] tracking-[0.16em] font-bold text-[#739168] mb-1.5 uppercase">
              ● WINNER OPERATIONS
            </label>
            <h2 className="font-['Manrope'] text-2xl md:text-3xl font-bold text-[#1b2c22] mb-1.5 tracking-tight flex items-center gap-2">
              <Trophy size={24} className="text-[#254a36]" /> Verification & Payouts
            </h2>
            <p className="text-xs md:text-sm text-[#728174] m-0">
              Review winner claims, verify score proof, and confirm payouts.
            </p>
          </div>

          <div className="bg-white border border-[#e1e7dc] rounded-xl p-5 md:p-6 shadow-sm">
            {winners.length ? (
              <div className="flex flex-col gap-3">
                {winners.map((w) => (
                  <div
                    key={w._id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#fbfcf9] hover:bg-white border border-[#e5ebe0] hover:border-[#cbd8c4] rounded-lg transition"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <strong className="text-sm font-bold text-[#1b2c22]">
                        {w.user?.name || "Anonymous Member"}
                      </strong>
                      <span className="bg-[#e9f2e5] text-[#254a36] text-[11px] font-bold px-2 py-0.5 rounded border border-[#d2e2cd]">
                        {w.matchTier}-match
                      </span>
                      <span className="font-bold text-sm text-[#254a36]">
                        {money(w.prizeAmount)}
                      </span>
                      {w.proofUrl && (
                        <a
                          href={w.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#254a36] hover:underline font-semibold"
                        >
                          <ExternalLink size={12} /> View proof
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <select
                        value={w.verificationStatus}
                        onChange={(e) => review(w._id, e.target.value)}
                        className="px-2.5 py-1.5 bg-[#fbfcf8] border border-[#d5ded0] rounded-md text-xs font-semibold text-[#1b2c22] focus:ring-2 focus:ring-[#254a36]/20 cursor-pointer"
                      >
                        <option value="pending">pending</option>
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                      </select>

                      {w.payoutStatus === "paid" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
                          <CheckCircle2 size={13} /> Paid
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => paid(w._id)}
                          disabled={w.verificationStatus !== "approved"}
                          className="inline-flex items-center gap-1 bg-[#254a36] hover:bg-[#183b29] text-white text-xs font-bold px-3 py-1.5 rounded-md transition cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Mark paid
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#8a9689] py-6 text-xs md:text-sm m-0">
                No winners recorded yet.
              </p>
            )}
          </div>
        </section>
      </main>
    </Shell>
  );
}
