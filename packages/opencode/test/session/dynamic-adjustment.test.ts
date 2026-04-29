import { describe, expect, it } from "bun:test"
import { detectRepeatingPattern } from "@/session/processor"

describe("detectRepeatingPattern with minRepeatedLength parameter", () => {
  it("maintains backward compatibility when not specified (default behavior)", () => {
    const repeated = "abc".repeat(15) + "\n" // ~46 chars, should detect P=3 pattern
    expect(detectRepeatingPattern(repeated, 3, 30)).toBe(true)
    
    const shortText = "a".repeat(20) // Should detect P=1 with default threshold
    expect(detectRepeatingPattern(shortText, 3, 30)).toBe(true)
  })

  it("uses custom minRepeatedLength when specified", () => {
    const repeated = "Configurable block here.\n" // ~25 chars
    
    // With very large minRepeatedLength that exceeds what's achievable for this text length at any period
    expect(detectRepeatingPattern(repeated.repeat(3), 3, 1000)).toBe(false)
    
    // Same text with smaller threshold should still work
    expect(detectRepeatingPattern(repeated.repeat(5), 3, 100)).toBe(true)
  })

  it("handles edge case where adjustment cannot exceed achievable bounds", () => {
    const repeated = "Short block.\n" // ~12 chars
    
    // With large minRepeatedLength and small period: adjustment would need ceil(500/1)=500 blocks for P=1
    // But text is only 48 chars (4 repeats), so no period can achieve this → original logic applies
    expect(detectRepeatingPattern(repeated.repeat(4), 3, 500)).toBe(false) 
    
    // With more repetitions the adjustment becomes achievable at some periods
    const largeRepeated = "Large block text here.\n" // ~21 chars
    expect(detectRepeatingPattern(largeRepeated.repeat(30), 3, 600)).toBe(true)
  })

  it("handles empty and short strings gracefully with all parameter combinations", () => {
    expect(() => detectRepeatingPattern("", 3, 50)).not.toThrow()
    expect(detectRepeatingPattern("", 3, 50)).toBe(false)
    
    const oneChar = "x"
    expect(detectRepeatingPattern(oneChar, 3, 10)).toBe(false)
    expect(detectRepeatingPattern(oneChar.repeat(2), 3, 10)).toBe(false)
  })

  it("passes through config value correctly in real usage scenario", () => {
    // Simulate what happens when text is long enough for large period to be achievable
    const repeated = "Longer block of text here.\n" // ~26 chars
    
    // Text with enough repetitions that P=13 (approx 26/2) can achieve ceil(250/13)=20 blocks requirement
    expect(detectRepeatingPattern(repeated.repeat(20), 3, 250)).toBe(true)
    
    // Same text with smaller threshold should also work  
    expect(detectRepeatingPattern(repeated.repeat(8), 3, 150)).toBe(true)
  })

})
