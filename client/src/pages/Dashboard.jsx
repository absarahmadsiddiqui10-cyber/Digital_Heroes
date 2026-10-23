import React, { useEffect, useState } from "react";
import Shell from "../components/common/Shell.jsx";
import { api } from "../services/api.js";
import { money } from "../utils/formatters.js";
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  HeartHandshake,
  CheckCircle2,
  Trophy,
  Sparkles,
  Lock,
  ExternalLink,
  Upload,
} from "lucide-react";

export default function Dashboard() {
  let [d, D] = useState(null),
    [err, E] = useState(""),
    [ok, O] = useState(""),
    [score, S] = useState({
      value: 32,
      date: new Date().toISOString().slice(0, 10),
    }),
    [charities, C] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [submittingEntry, setSubmittingEntry] = useState(false);
  const [proofUrls, setProofUrls] = useState({});

  async function load() {
    try {
      D(await api("/dashboard"));
      C((await api("/charities")).charities);
    } catch (e) {
      E(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    try {
      await api("/scores", {
        method: "POST",
        body: JSON.stringify({ ...score, value: +score.value }),
      });
      O("Score saved");
      load();
    } catch (e) {
      E(e.message);
    }
  }

  async function del(id) {
    try {
      await api("/scores/" + id, { method: "DELETE" });
      load();
    } catch (e) {
      E(e.message);
    }
  }

  async function charity(e) {
    e.preventDefault();
    try {
      await api("/charity-selection", {
        method: "PUT",
        body: JSON.stringify({
          charityId: e.target.charityId.value,
          percentage: +e.target.percentage.value,
        }),
      });
      O("Charity updated");
      load();
    } catch (e) {
      E(e.message);
    }
  }

  function toggleNumber(number) {
    setSelectedNumbers((current) =>
      current.includes(number)
        ? current.filter((n) => n !== number)
        : current.length < 5
          ? [...current, number]
          : current,
    );
  }

  async function submitEntry(drawId) {
    if (selectedNumbers.length !== 5) {
      E("Please select exactly 5 numbers.");
      return;
    }

    try {
      E("");
      O("");
      setSubmittingEntry(true);

      const result = await api(`/draws/${drawId}/entries`, {
        method: "POST",
        body: JSON.stringify({ numbers: selectedNumbers }),
      });

      O(result.message || "Draw entry submitted successfully.");
      setSelectedNumbers([]);
    } catch (error) {
      E(error.message);
    } finally {
      setSubmittingEntry(false);
    }
  }

  async function submitProof(winnerId) {
    try {
      E("");
      O("");

      const result = await api(`/winners/${winnerId}/proof`, {
        method: "POST",
        body: JSON.stringify({
          proofUrl: proofUrls[winnerId],
        }),
      });

      O("Proof submitted successfully.");
      setProofUrls((prev) => ({
        ...prev,
        [winnerId]: "",
      }));
      await load();
    } catch (error) {
      E(error.message);
    }
  }

  async function pay() {
    try {
      let order = await api("/payments/order", {
        method: "POST",
        body: JSON.stringify({ plan: d.subscription?.plan || "monthly" }),
      });
      if (!window.Razorpay)
        throw Error(
          "Razorpay checkout not loaded; check test key and internet.",
        );
      let r = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Digital Heroes",
        description: "Demo membership",
        order_id: order.orderId,
        handler: async (r) => {
          try {
            await api("/payments/verify", {
              method: "POST",
              body: JSON.stringify(r),
            });
            O("Payment verified; membership active");
            load();
          } catch (e) {
            E(e.message);
          }
        },
      });
      r.open();
    } catch (e) {
      E(e.message);
    }
  }

  if (!d)
    return (
      <Shell>
        <main className="section">Loading dashboard… {err}</main>
      </Shell>
    );

  let sel = d.charitySelection;
  const selectedCharityId = sel?.charity?._id || "";
  const selectedPercentage = sel?.percentage ?? 10;

  return (
    <Shell>
      <main className="section">
        <label>YOUR PERSONAL SPACE</label>
        <h1>
          Good to see you, <i>{d.user.name.split(" ")[0]}.</i>
        </h1>
        <p>
          Membership: <b>{d.subscription?.status || "inactive"}</b>{" "}
          {d.subscription?.renewalDate &&
            "· renews " +
              new Date(d.subscription.renewalDate).toLocaleDateString()}
        </p>
        {err && <p className="error">{err}</p>}
        {ok && <p className="success">{ok}</p>}
        <div className="cards metrics">
          <article>
            <small>LATEST SCORE</small>
            <h2>{d.scores[0]?.value ?? "—"}</h2>
          </article>
          <article>
            <small>DRAWS ENTERED</small>
            <h2>{d.drawsEntered}</h2>
          </article>
          <article>
            <small>TOTAL WINNINGS PAID</small>
            <h2>{money(d.totalWinnings)}</h2>
          </article>
        </div>
        {d.subscription?.status !== "active" && (
          <article className="callout">
            <h3>Make your game count.</h3>
            <p>Activate your membership to unlock score management.</p>
            <button className="btn" onClick={pay}>
              Pay with Razorpay Test Mode ↗
            </button>
          </article>
        )}
        {/* ================= SCORES & CHARITY PREFERENCE (EQUAL HEIGHT) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8 items-stretch">
          {/* Card 1: Your Latest Scores */}
          <div className="bg-white border border-[#e1e7dc] rounded-xl p-5 md:p-6 shadow-sm flex flex-col lg:h-[530px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#edf1eb] shrink-0">
              <div>
                <label className="block text-[10px] tracking-[0.16em] font-bold text-[#739168] mb-1 uppercase">
                  PERFORMANCE
                </label>
                <h3 className="font-['Manrope'] text-xl font-bold text-[#1b2c22] m-0 flex items-center gap-2">
                  <Target size={20} className="text-[#254a36]" /> Your Latest Scores
                </h3>
              </div>
              <span className="bg-[#edf3ea] text-[#254a36] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#dbe6d7]">
                {d.scores.length} / 5 Logged
              </span>
            </div>

            {/* Form to add score */}
            <form onSubmit={add} className="bg-[#fbfcf8] border border-[#e5ebe0] rounded-lg p-3.5 mb-3.5 shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <label className="block text-[11px] font-semibold text-[#536454]">
                  Stableford Score (1–45)
                  <input
                    type="number"
                    min="1"
                    max="45"
                    required
                    value={score.value}
                    onChange={(e) => S({ ...score, value: e.target.value })}
                    className="block w-full mt-1 px-3 py-2 border border-[#dce3d8] bg-white rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition"
                  />
                </label>

                <label className="block text-[11px] font-semibold text-[#536454]">
                  Round Date
                  <input
                    type="date"
                    required
                    value={score.date}
                    onChange={(e) => S({ ...score, date: e.target.value })}
                    className="block w-full mt-1 px-3 py-2 border border-[#dce3d8] bg-white rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-[#254a36] hover:bg-[#183b29] text-white border-0 rounded-md py-2 px-3 text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <Plus size={14} /> Add Score
              </button>
            </form>

            {/* Scrollable Scores List */}
            <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1">
              {d.scores.length ? (
                d.scores.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between p-2.5 bg-[#fbfcf9] hover:bg-white border border-[#edf2ea] hover:border-[#cbd8c4] rounded-lg transition shrink-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#e8f1e5] text-[#254a36] font-extrabold text-xs flex items-center justify-center border border-[#d3e3cd]">
                        {s.value}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-[#1b2c22] block">
                          {s.value} Points
                        </span>
                        <small className="text-[11px] text-[#788879] inline-flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(s.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </small>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => del(s._id)}
                      className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-800 bg-red-50/60 hover:bg-red-100/80 px-2 py-1 rounded transition cursor-pointer border border-red-200/60"
                      title="Delete this score"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#8a9689] py-8 text-xs m-auto">
                  No scores logged yet. Add your first score above.
                </p>
              )}
            </div>

            <small className="block text-[10px] text-[#869586] pt-2.5 mt-auto border-t border-[#edf1ea] shrink-0 text-center">
              Only latest five retained; one score per date.
            </small>
          </div>

          {/* Card 2: Chosen Charity & Impact */}
          <div className="bg-white border border-[#e1e7dc] rounded-xl p-5 md:p-6 shadow-sm flex flex-col lg:h-[530px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#edf1eb] shrink-0">
              <div>
                <label className="block text-[10px] tracking-[0.16em] font-bold text-[#739168] mb-1 uppercase">
                  YOUR IMPACT
                </label>
                <h3 className="font-['Manrope'] text-xl font-bold text-[#1b2c22] m-0 flex items-center gap-2">
                  <HeartHandshake size={20} className="text-[#254a36]" /> Chosen Charity
                </h3>
              </div>
              <span className="bg-[#edf3ea] text-[#254a36] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#dbe6d7]">
                {selectedPercentage}% Pledged
              </span>
            </div>

            <form onSubmit={charity} className="flex flex-col flex-1 justify-between">
              <div className="space-y-3.5">
                {/* Active Charity Card Preview */}
                <div className="bg-[#f7faf4] border border-[#d9e6d4] rounded-lg p-3.5">
                  <small className="text-[10px] uppercase tracking-wider text-[#688264] font-bold block mb-1">
                    CURRENT SELECTION
                  </small>
                  <strong className="text-sm text-[#1b2c22] block font-bold">
                    {sel?.charity?.name || "No charity selected"}
                  </strong>
                  {sel?.charity?.category && (
                    <span className="inline-block text-[10px] font-semibold text-[#254a36] bg-[#e4ede0] border border-[#cfe0cb] px-2 py-0.5 rounded mt-1">
                      {sel.charity.category}
                    </span>
                  )}
                  {sel?.charity?.description && (
                    <p className="text-xs text-[#637365] mt-1.5 mb-0 leading-relaxed line-clamp-2">
                      {sel.charity.description}
                    </p>
                  )}
                </div>

                {/* Charity Selection Dropdown */}
                <label className="block text-[11px] font-semibold text-[#536454]">
                  Change Partner Charity
                  <select
                    name="charityId"
                    value={selectedCharityId}
                    required
                    onChange={(e) => {
                      const selected = e.target.value;
                      D((prev) => ({
                        ...prev,
                        charitySelection: {
                          ...prev.charitySelection,
                          charity:
                            charities.find((c) => c._id === selected) || null,
                        },
                      }));
                    }}
                    className="block w-full mt-1 px-3.5 py-2 border border-[#dce3d8] bg-[#fbfcf8] rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition cursor-pointer"
                  >
                    {charities.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.category || "General"})
                      </option>
                    ))}
                  </select>
                </label>

                {/* Contribution Percentage Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-[#536454]">
                      Contribution % from Winnings
                    </label>
                    <span className="text-xs font-bold text-[#254a36] bg-[#edf4ea] border border-[#d1e2cd] px-2 py-0.5 rounded">
                      {selectedPercentage}%
                    </span>
                  </div>

                  <input
                    name="percentage"
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={selectedPercentage}
                    onChange={(e) => {
                      const percentage = Number(e.target.value);
                      D((prev) => ({
                        ...prev,
                        charitySelection: {
                          ...prev.charitySelection,
                          percentage,
                        },
                      }));
                    }}
                    className="w-full h-2 bg-[#e2eadc] rounded-lg appearance-none cursor-pointer accent-[#254a36]"
                  />
                  <div className="flex justify-between text-[10px] text-[#7a8a7c] mt-1 font-semibold">
                    <span>10% (Min)</span>
                    <span>50%</span>
                    <span>100% (All-in)</span>
                  </div>
                </div>

                <div className="bg-[#fbfcf8] border border-dashed border-[#dce3d8] rounded-lg p-2.5 text-xs text-[#637565]">
                  <p className="m-0 leading-relaxed text-[11px]">
                    Every round you win will donate <b>{selectedPercentage}%</b> directly to <b>{sel?.charity?.name || "your selected charity"}</b> to support community projects.
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-auto shrink-0">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#254a36] hover:bg-[#183b29] text-white border-0 rounded-md py-2.5 px-4 text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  <CheckCircle2 size={14} /> Save Impact Preference
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ================= PUBLISHED DRAWS & NUMBER SELECTION ================= */}
        <section className="my-10 pt-8 border-t border-[#e3e8de]">
          <div className="mb-6">
            <label className="inline-block text-[10px] tracking-[0.16em] font-bold text-[#739168] mb-1.5 uppercase">
              ● MONTHLY DRAW
            </label>
            <h2 className="font-['Manrope'] text-2xl md:text-3xl font-bold text-[#1b2c22] mb-1.5 tracking-tight flex items-center gap-2">
              <Sparkles size={24} className="text-[#254a36]" /> Published Results & Number Entry
            </h2>
            <p className="text-xs md:text-sm text-[#728174] m-0">
              Pick your 5 lucky numbers (1–45) for active rounds or review official winning numbers.
            </p>
          </div>

          {d.draws.length ? (
            <div className="flex flex-col gap-6">
              {d.draws.map((draw) => {
                const savedEntry = (d.drawEntries || []).find(
                  (entry) => entry.draw?._id === draw._id,
                );

                const isLocked = Boolean(savedEntry);
                const savedNumbers = savedEntry?.numbers || [];
                const selected = isLocked ? savedNumbers : selectedNumbers;

                return (
                  <div
                    key={draw._id}
                    className="bg-white border border-[#e1e7dc] rounded-2xl p-5 md:p-6 shadow-sm transition hover:shadow-md"
                  >
                    {/* Top Row: Title, Date, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#edf1eb] gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#e8f1e5] text-[#254a36] font-bold flex items-center justify-center shrink-0 border border-[#d2e2ce]">
                          <Trophy size={20} />
                        </div>
                        <div>
                          <h3 className="font-['Manrope'] text-lg font-bold text-[#1b2c22] m-0">
                            {draw.title}
                          </h3>
                          <small className="text-[#728274] text-xs inline-flex items-center gap-1 mt-0.5">
                            <Calendar size={12} />
                            {draw.drawDate
                              ? `Draw Date: ${new Date(draw.drawDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}`
                              : "Date not specified"}
                          </small>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full border ${
                            draw.status === "completed"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {draw.status === "completed"
                            ? "✓ Draw Completed"
                            : "● Active Round"}
                        </span>

                        {isLocked && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#254a36] text-white px-3 py-1 rounded-full shadow-sm">
                            <Lock size={11} /> Entry Locked
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Winning Numbers Banner (if completed) */}
                    {draw.status === "completed" && draw.numbers?.length > 0 && (
                      <div className="bg-[#f7faf4] border border-[#dce7d9] rounded-xl p-4 my-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#698465] block mb-2.5">
                          🏆 OFFICIAL WINNING NUMBERS
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {draw.numbers.map((num, i) => (
                            <span
                              key={i}
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#254a36] to-[#153323] text-white font-extrabold text-sm flex items-center justify-center shadow-md border-2 border-[#83a16c]"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submitted Entry Banner */}
                    {savedEntry && (
                      <div className="bg-[#edf5ea] border border-[#cbdcc6] rounded-xl p-4 my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-[#254a36] uppercase tracking-wider block mb-2">
                            YOUR SUBMITTED 5 NUMBERS
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {savedNumbers.map((num, i) => {
                              const isMatch = draw.numbers?.includes(num);
                              return (
                                <span
                                  key={i}
                                  className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shadow-sm border transition ${
                                    isMatch
                                      ? "bg-amber-400 text-amber-950 border-amber-500 font-extrabold ring-2 ring-amber-300"
                                      : "bg-white text-[#254a36] border-[#cbdcc6]"
                                  }`}
                                  title={isMatch ? "Winning match!" : "Submitted number"}
                                >
                                  {num}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-[#38533b] bg-white/70 px-3 py-1.5 rounded-md border border-[#c4d6bf] shrink-0 self-start sm:self-auto flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#254a36]" /> Selection locked for this round
                        </span>
                      </div>
                    )}

                    {/* Number Picker Grid */}
                    <div className="my-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#536454]">
                          {isLocked
                            ? "Round Entry Numbers:"
                            : "Select 5 unique numbers from 1 to 45:"}
                        </span>
                        {!isLocked && (
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              selected.length === 5
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {selected.length === 5
                              ? "✓ 5 of 5 Selected"
                              : `Selected: ${selected.length}/5`}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-[repeat(auto-fill,minmax(42px,1fr))] gap-2 p-3.5 bg-[#fbfcf8] border border-[#e3ebe0] rounded-xl">
                        {Array.from({ length: 45 }, (_, index) => index + 1).map(
                          (number) => {
                            const isSelected = selected.includes(number);
                            const isMatch = isLocked && draw.numbers?.includes(number);

                            return (
                              <button
                                key={number}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => toggleNumber(number)}
                                disabled={
                                  isLocked ||
                                  submittingEntry ||
                                  (!isSelected && selectedNumbers.length >= 5)
                                }
                                className={`h-10 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                                  isMatch
                                    ? "bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-md font-extrabold ring-2 ring-amber-300"
                                    : isSelected
                                      ? "bg-[#254a36] text-white border-2 border-[#153424] shadow-md font-extrabold scale-105"
                                      : isLocked
                                        ? "bg-white text-slate-400 border border-[#e7eee4] cursor-not-allowed opacity-60"
                                        : selectedNumbers.length >= 5
                                          ? "bg-white text-slate-300 border border-[#eef3ec] cursor-not-allowed opacity-40"
                                          : "bg-white hover:bg-[#edf5ea] text-[#1b2c22] border border-[#d6dfd2] hover:border-[#254a36] hover:shadow-sm"
                                }`}
                              >
                                {number}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-[#edf1eb] gap-3">
                      <p className="text-xs text-[#728274] m-0">
                        {isLocked
                          ? "Entry is registered in this draw. Good luck!"
                          : selected.length === 5
                            ? "All 5 numbers chosen. Ready to submit!"
                            : `Please choose ${5 - selected.length} more number${
                                5 - selected.length === 1 ? "" : "s"
                              } to enter.`}
                      </p>

                      {isLocked ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#e8f1e5] text-[#254a36] text-xs font-bold px-4 py-2 rounded-lg border border-[#cde0c8] self-start sm:self-auto">
                          <CheckCircle2 size={14} /> Entry Submitted
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-1.5 bg-[#254a36] hover:bg-[#183b29] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto"
                          disabled={selectedNumbers.length !== 5 || submittingEntry}
                          onClick={() => submitEntry(draw._id)}
                        >
                          <Sparkles size={14} />
                          {submittingEntry ? "Submitting..." : "Submit Entry"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#e1e7dc] rounded-2xl p-8 text-center text-[#7e8f80] shadow-sm">
              <Sparkles size={28} className="mx-auto mb-2 text-[#a3b8a1]" />
              <p className="m-0 text-sm">No published draws yet. Check back soon for the next round!</p>
            </div>
          )}
        </section>

        {/* ================= WINNINGS & PROOF SUBMISSION ================= */}
        <section className="my-10 pt-8 border-t border-[#e3e8de]">
          <div className="mb-6">
            <label className="inline-block text-[10px] tracking-[0.16em] font-bold text-[#739168] mb-1.5 uppercase">
              ● YOUR REWARDS
            </label>
            <h2 className="font-['Manrope'] text-2xl md:text-3xl font-bold text-[#1b2c22] mb-1.5 tracking-tight flex items-center gap-2">
              <Trophy size={24} className="text-[#254a36]" /> Winnings & Verification
            </h2>
            <p className="text-xs md:text-sm text-[#728174] m-0">
              Submit scorecard proof for verified matches and track your payout disbursements.
            </p>
          </div>

          <div className="bg-white border border-[#e1e7dc] rounded-2xl p-5 md:p-6 shadow-sm">
            {d.winners?.length ? (
              <div className="flex flex-col gap-4">
                {d.winners.map((winner) => (
                  <div
                    key={winner._id}
                    className="p-4 bg-[#fbfcf9] hover:bg-white border border-[#e5ebe0] hover:border-[#cbd8c4] rounded-xl transition shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#edf1ea]">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-[#e9f2e5] text-[#254a36] text-xs font-bold px-2.5 py-1 rounded-md border border-[#d2e2cd]">
                          {winner.matchTier}-match Prize
                        </span>
                        <strong className="text-lg font-bold text-[#1b2c22]">
                          {money(winner.prizeAmount)}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            winner.verificationStatus === "approved"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : winner.verificationStatus === "rejected"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          Verification: {winner.verificationStatus}
                        </span>

                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            winner.payoutStatus === "paid"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          Payout: {winner.payoutStatus}
                        </span>
                      </div>
                    </div>

                    {winner.proofUrl && (
                      <div className="pt-3 flex items-center gap-2 text-xs">
                        <span className="text-[#657667]">Proof submitted:</span>
                        <a
                          href={winner.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#254a36] hover:underline font-bold"
                        >
                          <ExternalLink size={12} /> View proof image ↗
                        </a>
                      </div>
                    )}

                    {winner.verificationStatus !== "approved" &&
                      winner.verificationStatus !== "rejected" && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            submitProof(winner._id);
                          }}
                          className="pt-3.5 mt-2 flex flex-wrap items-end gap-3"
                        >
                          <label className="block text-[11px] font-semibold text-[#536454] flex-1 min-w-[220px]">
                            Submit Scorecard Proof URL
                            <input
                              type="url"
                              required
                              value={proofUrls[winner._id] || ""}
                              onChange={(e) =>
                                setProofUrls((prev) => ({
                                  ...prev,
                                  [winner._id]: e.target.value,
                                }))
                              }
                              placeholder="https://example.com/scorecard.png"
                              className="block w-full mt-1 px-3.5 py-2 border border-[#dce3d8] bg-white rounded-md text-xs text-[#1b2c22] focus:outline-none focus:ring-2 focus:ring-[#254a36]/20 focus:border-[#254a36] transition"
                            />
                          </label>

                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 bg-[#254a36] hover:bg-[#183b29] text-white text-xs font-bold px-4 py-2 rounded-md transition cursor-pointer shadow-sm"
                          >
                            <Upload size={13} /> Submit Proof
                          </button>
                        </form>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#8a9689] py-8 text-xs md:text-sm m-0">
                No winning records yet. Match numbers in active draws to win prizes!
              </p>
            )}
          </div>
        </section>
      </main>
    </Shell>
  );
}
