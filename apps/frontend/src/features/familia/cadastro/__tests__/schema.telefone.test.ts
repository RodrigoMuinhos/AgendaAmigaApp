import { describe, expect, it } from "vitest";
import { brPhoneZ } from "../schema";

const ok = ["85997254989", "(85) 99725-4989", "85 99725 4989", "(11) 2345-6789"];
const bad = ["", "123", "(10) 91234-5678", "(85) 81234-5678", "(85) 99725-498"];

describe("brPhoneZ", () => {
  it("accepts valid Brazilian phone numbers", () => {
    ok.forEach((value) => {
      const result = brPhoneZ.safeParse(value);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid Brazilian phone numbers", () => {
    bad.forEach((value) => {
      const result = brPhoneZ.safeParse(value);
      expect(result.success).toBe(false);
    });
  });
});
