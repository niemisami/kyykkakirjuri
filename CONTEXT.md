# Kyykkakirjuri

A mobile-web scorekeeping app for referees and scorekeepers tracking a live kyykkä game. Captures the state of both target squaret after each player turn, calculates round and peli scores, and guides the referee through the game flow.

## Language

### Participants

**Team (Joukkue)**:
A named group of players that competes in games. Has a permanent roster of registered players. A team has a name, optional home location, description, and contact email.
Finnish: Joukkue

**Player (Pelaaja)**:
A named individual who belongs to at most one team at a time (`teamId`). A player may be unassigned (no team). Has a name and optional email. Players on a team's roster participate in games via `gameTeamPlayer`. A player may be optionally owned by a User via a nullable 1:1 `userId` FK — this lets a signed-in user claim their own player identity. Not all players have a linked user (roster entries added by team managers).
Finnish: Pelaaja
_Avoid_: participant, thrower (use "player" in code)

**User (Käyttäjä)**:
A signed-in human using the app. A user is the identity that owns teams, accesses the dashboard, and accumulates history across games. Distinct from `Pelaaja` (a roster entry) — a user may or may not also appear as a `Pelaaja` on some team. A user may optionally create and own a single Player entity (1:1 via `player.userId`). Authenticated via Better Auth (Google). Future: a user will hold one or more roles (game manager, referee, player).
Finnish: Käyttäjä
_Avoid_: account, member, profile (use "user" in code)

---



**Kyykkä**:
A cylindrical wooden piece standing in the target square. Plural: kyykät. Each target square starts with 40 kyykät. The word also refers to the game itself — context resolves the ambiguity.
Finnish: Kyykkä
_Avoid_: pin, peg, block, skittle

**Karttu**:
The wooden throwing stick used to knock kyykät out of the target square. Each turn uses 4 kartut (2 players × 2 throws each).
_Avoid_: bat, stick, baton, throw (when referring to the object)
Finnish: Karttu

**Game square**:
The 5×5 m square where kyykät are placed and from which they must be knocked out. Each end of the field has one. A team attacks the opposing team's target square.
Finnish: Pelineliö
_Avoid_: playing area (too broad), field

**Throwing square**:
The throwing area from which kartut are thrown. Not actively tracked by this app.
Finnish: Heittoneliö
_Avoid_: throwing box, launch area

---

### Game structure

**Game**:
A complete game, consisting of exactly 2 rounds with sides swapped between them. Each team's final score is the sum of their two round scores.
Finnish: Peli
_Avoid_: match, game (in English code — use `game` as the model name)

**Round**:
One round of play. Each team throws 4 turns (16 kartut total) per round. Score is calculated at the end of the round based on kyykät remaining in the target target square.
Finnish: Erä
_Avoid_: half, period, set

**Turn**:
One team's throwing turn: 2 players each throw 2 kartut (4 kartut total). Players are paired by playing order: players 1 & 2 form the first pair, players 3 & 4 the second. Pairs rotate: 1+2, 3+4, 1+2, 3+4 within a round. A turn contains exactly 2 player throws.
Finnish: Heittovuoro
_Avoid_: "round"

**Player throw**:
One player's full throwing opportunity within a turn: 2 kartut. A player throw contains exactly 2 single throws.
Finnish: Pelaajan heittovuoro

**Single throw**:
One individual karttu throw by a single player. The referee records one `knockedOut` delta and one signed pappi delta (stored in field `pappiCount`) after each single throw.
Finnish: Yksittäinen heitto
_Avoid_: player throw, turn

**Knocked out (poistettu)**:
A kyykkä that has left the game square entirely during a single throw, whether it was previously inside (akka) or on the boundary (pappi). Recorded per single throw as `knockedOut` — a delta of how many exited during this specific throw, not a running total. The cumulative sum across all single throws in a round, combined with cumulative pappi deltas, gives: `akat = 40 - ΣknockedOut - ΣpappiCount`.
Finnish singular: poistettu. Finnish plural / UI label: Poistot.
_Avoid_: cleared (use "field cleared" only for the scoring event), removed

**Opening turn**:
The mandatory opening throw of a game. It must knock at least one kyykkä out of the target square before regular play continues. In this app, the avaus is treated as part of the first turn — no separate tracking.
Finnish: Avaus
_Avoid_: opening throw, first throw (when referring to the rule concept)

**Halftime**:
The hafltime break between round 1 and round 2. Sides are swapped and player substitutions are allowed. The app presents substitution options at the halftime screen.
Finnish: Erätauko
_Avoid_: break

---

### Scoring

**Akka**:
A kyykkä remaining **inside** the target square at the time of scoring. Worth **-2 points**.
Finnish: Akka or akat for multiple
_Avoid_: remaining piece, skittle (when scoring is involved)

**Pappi**:
A kyykkä resting on the **boundary line** of the target square at the time of scoring. Worth **-1 point**. A nurkkapappi (corner pappi) is also treated as -1 point; no distinction is made in this app.
Finnish: Pappi or papit for multiple
_Avoid_: boundary piece, edge piece

**Pappi delta (stored in `pappiCount`)**:
The signed change in the number of papit caused by a single throw. Positive means papit were created on the boundary; negative means a previously boundary kyykkä was struck back into the game square.
Finnish UI field label: Papit
_Avoid_: pappi snapshot, absolute pappi count

**Kuokkavieras**:
A kyykkä that has bounced into the gap between the two target squaret. Per official rules, worth -2 points. **Not tracked by this app** — see ADR-0001.
Finnish: Kuokkavieras
_Avoid_: stray, gap piece (use the official term in any code comments referencing the rule)

**Field cleared (kenttä tyhjä)**:
The state where akat = 0 and papit = 0 in the target target square before a team has used all 16 kartut. When this happens the team's round score is **+N**, where N is the number of unused kartut. This replaces the normal negative scoring.
Finnish: Field
_Avoid_: "full clear", "bonus"

---

## Example dialogue

> **Referee**: "First karttu: 4 flew out, and I see 1 pappi on the line."
> **Dev**: "Record that single throw as knockedOut = 4, pappiCount = +1."
> **Referee**: "Second karttu by same player hit that pappi back inside, and nothing flew out."
> **Dev**: "Record that single throw as knockedOut = 0, pappiCount = -1. The app updates akat and score from cumulative deltas."
> **Referee**: "The next team just cleared everything on turn 3."
> **Dev**: "Akat = 0 and papit = 0 after turn 3 of 4 — field cleared. Their round score is +4 (4 unused kartut)."
> **Referee**: "What about that kyykkä that bounced into the middle?"
> **Dev**: "That's a kuokkavieras. This app doesn't track those — count it as cleared."
