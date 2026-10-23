import React from "react";
import { Link } from "react-router-dom";
import Shell from "../components/common/Shell.jsx";

export default function Home() {
  return (
    <Shell>
      <main>
        <section className="hero">
          <div>
            <label>● SPORT WITH A PURPOSE</label>
            <h1>
              Your game.
              <br />
              Their <i>future.</i>
            </h1>
            <p>
              Track your golf performance, take part in monthly prize draws, and
              support a cause you believe in. Every round can make a difference.
            </p>
            <Link className="btn" to="/signup">
              Become a member ↗
            </Link>{" "}
            <Link to="/charities" className="plain">
              Explore charities →
            </Link>
          </div>
          <div className="art">
            <div className="orb"></div>
            <div className="poster">
              <small>IMPACT IN MOTION</small>
              <strong>
                01<span>.</span>
              </strong>
              <hr />
              <small>ONE PLAYER · ONE BETTER WORLD</small>
            </div>
            <aside>♡ Give back, every month</aside>
          </div>
        </section>
        <section className="strip">
          <div>
            ◎ <b>Track your game</b>
            <small>Keep your latest five scores</small>
          </div>
          <div>
            ♧ <b>Monthly draws</b>
            <small>Three ways to match</small>
          </div>
          <div>
            ♡ <b>Choose your cause</b>
            <small>At least 10% to charity</small>
          </div>
        </section>
        <section className="section">
          <label>HOW IT WORKS</label>
          <h2>
            Three steps. <i>Real-world impact.</i>
          </h2>
          <div className="cards">
            <article>
              <small>01 / JOIN</small>
              <h3>Become a member</h3>
              <p>Choose a plan and pick the charity you want to support.</p>
            </article>
            <article>
              <small>02 / PLAY</small>
              <h3>Track your scores</h3>
              <p>
                Add Stableford scores and follow your monthly draw
                participation.
              </p>
            </article>
            <article>
              <small>03 / GIVE</small>
              <h3>Make it matter</h3>
              <p>Your chosen share goes towards a cause you care about.</p>
            </article>
          </div>
        </section>
        <section className="green">
          <label>THE HEART OF IT</label>
          <h2>
            Good things happen
            <br />
            when we <i>play together.</i>
          </h2>
          <p>
            Support youth opportunity, clean water, education, and a greener
            tomorrow.
          </p>
          <Link className="btn light" to="/charities">
            Find your cause ↗
          </Link>
        </section>
        <section className="section">
          <label>MEMBERSHIP · DEMO PRICES</label>
          <h2>
            Play more. <i>Give more.</i>
          </h2>
          <div className="cards plans">
            <article>
              <small>FLEXIBLE</small>
              <h3>Monthly</h3>
              <strong>
                ₹499 <small>/ month</small>
              </strong>
              <Link className="btn" to="/signup">
                Choose monthly
              </Link>
            </article>
            <article>
              <small>BEST VALUE</small>
              <h3>Yearly</h3>
              <strong>
                ₹4,999 <small>/ year</small>
              </strong>
              <Link className="btn" to="/signup">
                Choose yearly
              </Link>
            </article>
          </div>
          <p className="fine">
            Prices and prize-pool percentage are demo placeholders. Confirm
            business rules before production.
          </p>
        </section>
      </main>
    </Shell>
  );
}
