# Signed pappi delta in `pappiCount` (supersedes ADR-0002)

We record `pappiCount` as a signed per-single-throw delta instead of a snapshot count: positive values mean papit created on the boundary, negative values mean a boundary kyykkä was struck back into the square. This supersedes ADR-0002 because referees need to capture boundary reversals directly without recalculating absolute papit after each single throw. The trade-off is a misleading legacy field name (`pappiCount`), so domain docs use the canonical term **pappi delta** and explicitly map it to `pappiCount` for compatibility.
