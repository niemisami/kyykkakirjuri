# Kyykkakirjuri

A mobile-web scorekeeping app for referees and scorekeepers tracking a live kyykkä game. Captures the state of both target squaret after each heittovuoro, calculates erä and peli scores, and guides the referee through the game flow.

## Language

### Equipment & field

**Kyykkä**:
A cylindrical wooden piece standing in the target square. Plural: kyykät. Each target square starts with 40 kyykät. The word also refers to the game itself — context resolves the ambiguity.
_Avoid_: pin, peg, block, skittle

**Karttu**:
The wooden throwing stick used to knock kyykät out of the target square. Each heittovuoro uses 4 kartut (2 players × 2 throws each).
_Avoid_: bat, stick, baton, throw (when referring to the object)

**Pelineliö**:
The 5×5 m square where kyykät are placed and from which they must be knocked out. Each end of the field has one. A team attacks the opposing team's target square.
_Avoid_: playing area (too broad), field

**Heittoneliö**:
The throwing area from which kartut are thrown. Not actively tracked by this app.
_Avoid_: throwing box, launch area

---

### Game structure

**Peli**:
A complete game, consisting of exactly 2 erät with sides swapped between them. Each team's final score is the sum of their two erä scores.
_Avoid_: match, game (in English code — use `peli` as the model name)

**Erä**:
One round of play. Each team throws 4 heittovuorot (16 kartut total) per erä. Score is calculated at the end of the erä based on kyykät remaining in the target target square.
_Avoid_: half, period, set

**Heittovuoro**:
One team's throwing turn: 2 players each throw 2 kartut (4 kartut total). Players are paired by playing order: players 1 & 2 form the first pair, players 3 & 4 the second. Pairs rotate: 1+2, 3+4, 1+2, 3+4 within an erä. After each heittovuoro, the referee records the current akka and pappi counts.
_Avoid_: "turn", "round" (use heittovuoro specifically)

**Avaus**:
The mandatory opening throw of a peli. It must knock at least one kyykkä out of the target square before regular play continues. In this app, the avaus is treated as part of the first heittovuoro — no separate tracking.
_Avoid_: opening throw, first throw (when referring to the rule concept)

**Erätauko**:
The break between erä 1 and erä 2. Sides are swapped and player substitutions are allowed. The app presents substitution options at the halftime screen.
_Avoid_: halftime, break

---

### Scoring

**Akka**:
A kyykkä remaining **inside** the target square at the time of scoring. Worth **−2 points**.
_Avoid_: remaining piece, skittle (when scoring is involved)

**Pappi**:
A kyykkä resting on the **boundary line** of the target square at the time of scoring. Worth **−1 point**. A nurkkapappi (corner pappi) is also treated as −1 point; no distinction is made in this app.
_Avoid_: boundary piece, edge piece

**Kuokkavieras**:
A kyykkä that has bounced into the gap between the two target squaret. Per official rules, worth −2 points. **Not tracked by this app** — see ADR-0001.
_Avoid_: stray, gap piece (use the official term in any code comments referencing the rule)

**Field cleared (kenttä tyhjä)**:
The state where akat = 0 and papit = 0 in the target target square before a team has used all 16 kartut. When this happens the team's erä score is **+N**, where N is the number of unused kartut. This replaces the normal negative scoring.
_Avoid_: "full clear", "bonus"

---

## Example dialogue

> **Referee**: "They knocked out a bunch — I count 3 akat and 1 pappi left."
> **Dev**: "So after this heittovuoro, enter akka count = 3 and pappi count = 1."
> **Referee**: "Right. Oh wait, I miscounted — it's actually 2 akat."
> **Dev**: "No problem — edit the heittovuoro you just recorded and change it to 2."
> **Referee**: "The next team just cleared everything on heittovuoro 3."
> **Dev**: "Akat = 0 and papit = 0 after heittovuoro 3 of 4 — field cleared. Their erä score is +4 (4 unused kartut)."
> **Referee**: "What about that kyykkä that bounced into the middle?"
> **Dev**: "That's a kuokkavieras. This app doesn't track those — count it as cleared."
