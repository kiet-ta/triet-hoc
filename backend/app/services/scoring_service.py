from dataclasses import dataclass
from typing import Mapping


@dataclass(frozen=True)
class ScoreResult:
    key: str
    raw_score: float
    percentage: float
    rank: int


# Opposing philosophies: answering high on key A deducts from key B.
OPPOSING_MAP: dict[str, list[str]] = {
    "stoicism": ["epicureanism"],
    "epicureanism": ["stoicism"],
    "existentialism": ["nihilism", "confucian_ethics"],
    "nihilism": ["existentialism"],
    "confucian_ethics": ["existentialism", "absurdism"],
    "absurdism": ["confucian_ethics"],
    "pragmatism": ["idealism"],
    "idealism": ["materialism", "pragmatism"],
    "materialism": ["idealism"],
    "utilitarianism": ["humanism"],
    "humanism": ["utilitarianism"],
}


def calculate_scores(
    *,
    answers_by_code: Mapping[str, int],
    question_weights_by_code: Mapping[str, Mapping[str, int]],
    philosophy_keys: list[str],
) -> list[ScoreResult]:
    """
    Score each philosophy independently (not relative to others).

    Formula (per philosophy):
      raw_score  = Σ (answer_value × weight)         for direct questions
                 − Σ ((answer_value − 3) × weight)   opposing-map deductions
                   (neutral answer=3 → zero deduction)
      max_score  = Σ (5 × weight)                    for direct questions only
      percentage = clamp(raw / max × 100, 0, 100)    if max > 0, else 0 %

    This ensures percentages are absolute (each 0–100 %) and independent,
    so the chart reflects genuine alignment strength rather than share-of-total.
    """
    raw_scores: dict[str, float] = {key: 0.0 for key in philosophy_keys}
    max_scores: dict[str, float] = {key: 0.0 for key in philosophy_keys}

    for question_code, weights in question_weights_by_code.items():
        answer_value = answers_by_code.get(question_code)
        if answer_value is None:
            continue

        for phi_key, weight in weights.items():
            if weight <= 0 or phi_key not in raw_scores:
                continue

            # Direct contribution
            max_scores[phi_key] += 5 * weight
            raw_scores[phi_key] += answer_value * weight

            # Opposing deduction — neutral (3) has no effect;
            # agreeing strongly (5) deducts 2×weight; disagreeing (1) adds 2×weight.
            for opp_key in OPPOSING_MAP.get(phi_key, []):
                if opp_key not in raw_scores:
                    continue
                raw_scores[opp_key] -= (answer_value - 3) * weight

    sorted_scores: list[ScoreResult] = []
    for key in philosophy_keys:
        max_s = max_scores[key]
        if max_s > 0:
            pct = max(0.0, min(100.0, (raw_scores[key] / max_s) * 100))
        else:
            pct = 0.0  # Philosophy never referenced in any question

        sorted_scores.append(
            ScoreResult(
                key=key,
                raw_score=round(raw_scores[key], 2),
                percentage=round(pct, 2),
                rank=0,
            )
        )

    sorted_scores.sort(key=lambda item: (-item.percentage, -item.raw_score, item.key))

    return [
        ScoreResult(
            key=item.key,
            raw_score=item.raw_score,
            percentage=item.percentage,
            rank=index + 1,
        )
        for index, item in enumerate(sorted_scores)
    ]
