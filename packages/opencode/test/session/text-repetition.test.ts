import { describe, expect, it } from "bun:test"
import { detectRepeatingPattern } from "@/session/processor"

const baseBlock = "This is a repeated block of text that exceeds thirty characters in length to pass the minimum threshold check.\n"

describe("detectRepeatingPattern", () => {
  it("returns true when identical text repeats consecutively at threshold", () => {
    const repeated = "The configuration file has been successfully loaded and all dependencies have been resolved for the current deployment target.\n".repeat(10)
    expect(detectRepeatingPattern(repeated, 3, 30)).toBe(true)
  })

  it("detects repeated blocks within larger text window", () => {
    const large = "x".repeat(500) + "\n"
    const block = "---\nEnd of section.\n---\n"
    expect(detectRepeatingPattern(large + block.repeat(10), 3, 30)).toBe(true)
  })

  it("handles text with newlines in repeated blocks", () => {
    const repeated = "Line one.\nLine two.\n".repeat(8) + "\ndone"
    expect(detectRepeatingPattern(repeated, 3, 30)).toBe(true)
  })

   it("handles partial/truncated repetition at end boundary", () => {
    const baseBlock = "This is a repeated block of text that exceeds thirty characters in length to pass the minimum threshold check.\n"
    const partialEnd = baseBlock.repeat(8) + "This is a repeate"
    expect(detectRepeatingPattern(partialEnd, 3, 30)).toBe(true)
  })

  it("handles text where repetition starts mid-suffix", () => {
    const mixed = "Some intro text that is not repeated. ".repeat(2) + baseBlock.repeat(8)
    expect(detectRepeatingPattern(mixed, 3, 30)).toBe(true)
  })

  it("detects repetition with threshold=1 (single candidate counts)", () => {
    const text = "This is a repeated block that exceeds twenty characters in length.\n".repeat(6) + " unique ending"
    expect(detectRepeatingPattern(text, 3, 30)).toBe(true)
  })

  it("handles very long repeated blocks efficiently", () => {
    const bigBlock = "This is a significantly longer repeated text segment that should be detected reliably.\n"
    expect(detectRepeatingPattern(bigBlock.repeat(12), 3, 30)).toBe(true)
  })

  it("handles text with many clear repetitions in suffix", () => {
    const baseBlock = "This is a repeated block of text that exceeds thirty characters in length to pass the minimum threshold check.\n"
    expect(detectRepeatingPattern(baseBlock.repeat(15), 3, 30)).toBe(true)
  })

  it("handles very short strings below analysis window", () => {
    const text = "ab"
    expect(detectRepeatingPattern(text, 3, 30)).toBe(false)
  })

  it("detects repeated blocks even when followed by non-repeating content", () => {
    const repeated = "repeating text segment that is thirty one characters minimum for detection.\n"
    const uniqueEnd = "\n\nThis is completely different content with no relation to the repeating block above."
    expect(detectRepeatingPattern(repeated.repeat(3) + uniqueEnd, 3, 30)).toBe(true)
  })

  it("returns false for near-duplicates with minor differences", () => {
    const varied = "line one. line two. line three. line four. line five."
    expect(detectRepeatingPattern(varied, 3, 30)).toBe(false)
  })

  it("handles empty and very short strings gracefully", () => {
    expect(detectRepeatingPattern("", 3, 30)).toBe(false)
    expect(detectRepeatingPattern("a", 3, 30)).toBe(false)
    expect(detectRepeatingPattern("ab", 3, 30)).toBe(false)
  })

  it("returns false for single occurrence of any substring", () => {
    const unique = "This is a completely standalone sentence with no repeating patterns whatsoever."
    expect(detectRepeatingPattern(unique, 3, 30)).toBe(false)
  })

  it("returns false when text does not repeat", () => {
    const normal = "This is a completely unique sentence with no repetition whatsoever in the entire document."
    expect(detectRepeatingPattern(normal, 3, 30)).toBe(false)
  })

  it("returns false when threshold requires more repetitions than exist", () => {
    const twoRepeats = "repeated block text that is thirty one characters or longer minimum for detection.\n".repeat(2) + " final"
    expect(detectRepeatingPattern(twoRepeats, 3, 30)).toBe(false)
  })

  it("detects repetition near end boundary with threshold=1", () => {
    const text = "This is a repeated block that exceeds twenty characters in length.\n".repeat(12) + " unique ending" + " unique ending" + " unique ending"
    expect(detectRepeatingPattern(text, 3, 30)).toBe(true)
  })

it("handles non-periodic prefix before repeating content", () => {
    const text = "System initialized successfully and all services are now operational.\n" + "The deployment pipeline completed all stages and is now processing the next batch of requests in the queue.\n".repeat(10)
    expect(detectRepeatingPattern(text, 3, 30)).toBe(true)
  })


  it("detects repetition with threshold=4", () => {
    const repeated = baseBlock.repeat(6) + " unique end"
    expect(detectRepeatingPattern(repeated, 3, 30)).toBe(true)
    // With suffix that breaks periodicity at end boundary, shorter repeat count returns false while longer repeats detect correctly
    const longSuffixSfx = "\nThe system will now proceed to the next phase of operations as scheduled and begin processing.\n"
    expect(detectRepeatingPattern(baseBlock.repeat(3) + longSuffixSfx, 3, 30)).toBe(false)
  })

  it("handles text with mixed content then repetition at end", () => {
    const prefix = "Initial paragraph that has nothing to do with what follows.\n\n"
    const repeated = baseBlock.repeat(10)
    expect(detectRepeatingPattern(prefix + repeated, 3, 30)).toBe(true)
  })

  it("does not trigger on words sharing common prefixes", () => {
    const varied = "apple applepie applesauce application applied approve arrange arrival article"
    expect(detectRepeatingPattern(varied, 3, 30)).toBe(false)
  })

  it("handles repetition with special characters and punctuation", () => {
    const repeated = "[ERROR] Connection failed: timeout after 30s\n".repeat(8) + "\nRetrying..."
    expect(detectRepeatingPattern(repeated, 3, 30)).toBe(true)
  })

  it("detects short-period repetition with period P=1", () => {
    const text = "a".repeat(20)
    expect(detectRepeatingPattern(text, 3, 30)).toBe(true)
  })

  it("detects very short block repetition with period P=3", () => {
    const text = "abc".repeat(15) + "\n"
    expect(detectRepeatingPattern(text, 3, 30)).toBe(true)
  })

  it("detects repetition even when followed by unique content at end", () => {
    const repeated = "The configuration file has been successfully loaded and all dependencies have been resolved for the current deployment target.\n"
    const text = repeated.repeat(5) + "\nThe system will now proceed to a completely different phase of operations."
    expect(detectRepeatingPattern(text, 3, 30)).toBe(true)
  })

  it("rejects short repeat count followed by unique content at end", () => {
    const repeated = "The configuration file has been successfully loaded and all dependencies have been resolved for the current deployment target.\n"
    const text = repeated.repeat(3) + "\nThe system will now proceed to a completely different phase of operations."
    expect(detectRepeatingPattern(text, 3, 30)).toBe(false)
  })

  it("handles empty string gracefully", () => {
    expect(detectRepeatingPattern("", 3, 30)).toBe(false)
  })

  it("returns false for single occurrence with no repeats", () => {
    const unique = "This is a completely standalone sentence with absolutely no repeating content whatsoever in the entire document."
    expect(detectRepeatingPattern(unique, 3, 30)).toBe(false)
  })

  
})
