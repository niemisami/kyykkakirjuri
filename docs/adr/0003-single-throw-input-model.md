# Single-throw input model for live scoring

We record scoring input after each **single throw** (one karttu) instead of after each player throw (two kartut). This supersedes ADR-0002 because referees need score progression after every karttu and a clearer throw-by-throw flow (`P1-T1, P1-T2, P2-T1, P2-T2`) while preserving the existing round/turn structure. The trade-off is a more granular state model and editing history, but it aligns the app with the new officiating workflow and enables accurate mid-turn score visibility.
