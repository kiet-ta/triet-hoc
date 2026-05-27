from dataclasses import dataclass
from typing import Mapping


@dataclass(frozen=True)
class ScoreResult:
    key: str
    raw_score: float
    percentage: float
    rank: int


OPPOSING_MAP = {
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
    raw_scores = {key: 0.0 for key in philosophy_keys}
    max_scores = {key: 0.0 for key in philosophy_keys}

    for question_code, weights in question_weights_by_code.items():
        answer_value = answers_by_code.get(question_code)
        if answer_value is None:
            continue
            
        # Shift 1-5 scale to -2 to +2. So 3 is neutral (0 points).
        shifted_answer = answer_value - 3 
        
        effective_weights = {}
        for phi_key, weight in weights.items():
            if weight == 0:
                continue
            effective_weights[phi_key] = effective_weights.get(phi_key, 0) + weight
            
            # Apply negative weights to opposing philosophies
            opposing = OPPOSING_MAP.get(phi_key, [])
            for opp_key in opposing:
                effective_weights[opp_key] = effective_weights.get(opp_key, 0) - weight

        for phi_key, eff_weight in effective_weights.items():
            if phi_key not in raw_scores:
                continue
            # Max possible change is 2 * abs(weight)
            max_scores[phi_key] += 2 * abs(eff_weight)
            raw_scores[phi_key] += shifted_answer * eff_weight

    sorted_scores = []
    for key in philosophy_keys:
        max_s = max_scores[key]
        if max_s > 0:
            # Map raw score from [-max_s, +max_s] to [0%, 100%]
            percentage = ((raw_scores[key] + max_s) / (2 * max_s)) * 100
        else:
            percentage = 50.0  # Neutral
            
        sorted_scores.append(
            ScoreResult(
                key=key,
                raw_score=round(raw_scores[key], 2),
                percentage=round(percentage, 2),
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
