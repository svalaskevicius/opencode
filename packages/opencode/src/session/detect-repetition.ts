export const MIN_TEXT_LENGTH = 100
export const CHECK_INTERVAL = 2000

interface AccumulatorState {
	tokensSinceLastCheck: number
}

/**
 * Determines whether a repetition detection check should run for this delta.
 * Returns true if enough characters accumulated since last check (and text >= MIN_TEXT_LENGTH).
 * Updates accumulator state in place; resets to 0 when returning true.
 */
export function shouldRunRepetitionCheck(
	state: AccumulatorState,
	deltaLength: number,
): boolean {
	const total = state.tokensSinceLastCheck + deltaLength

	// Not enough text yet — accumulate silently (caller will skip via MIN_TEXT_LENGTH guard)
	if (total < MIN_TEXT_LENGTH) {
		state.tokensSinceLastCheck += deltaLength
		return false
	}

	// Below interval threshold — accumulate without running check
	if (total < CHECK_INTERVAL) {
		state.tokensSinceLastCheck = total
		return false
	}

	// Above both thresholds — run detection now, reset accumulator
	state.tokensSinceLastCheck = 0
	return true
}
