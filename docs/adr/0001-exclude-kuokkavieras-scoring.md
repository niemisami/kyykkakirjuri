# Exclude kuokkavieras from scoring

The official kyykkä rules define a kuokkavieras — a kyykkä that bounces into the gap between the two pelineliöt — as worth −2 penalty points. We chose not to track kuokkavieraat in this app. In practice they are rare, counting them requires the referee to maintain a third counter during an already-hectic scoring check, and the scoring weight (−2) is the same as an akka so the visual distinction matters less. The scoring model tracks only akat (−2) and papit (−1); kuokkavieraat are treated as cleared.

## Consequences

Scores will be slightly optimistic when a kuokkavieras occurs. If this becomes a problem in competitive play the feature can be added by introducing a `kuokkavieraat` field alongside `akat` and `papit` in the heittovuoro model.
