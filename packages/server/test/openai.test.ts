import { describe, expect, it } from "vitest";
import { splitTitle } from "../src/openai.js";

describe("splitTitle", () => {
  it("uses the first line as the title and the rest as the body", () => {
    const { title, body } = splitTitle("Deploy plan\n\n1. step\n2. step");
    expect(title).toBe("Deploy plan");
    expect(body).toBe("1. step\n2. step");
  });

  it("strips a leading markdown header marker", () => {
    const { title } = splitTitle("# Plan A\nbody here");
    expect(title).toBe("Plan A");
  });

  it("falls back to a default title when only one line is returned", () => {
    const { title, body } = splitTitle("just an answer");
    expect(title).toBe("Odin");
    expect(body).toBe("just an answer");
  });

  it("survives an empty response", () => {
    const { title, body } = splitTitle("");
    expect(title).toBe("Odin");
    expect(body).toBe("");
  });

  it("clips overly long titles", () => {
    const long = "a".repeat(200);
    const { title } = splitTitle(`${long}\nbody`);
    expect(title.length).toBeLessThanOrEqual(120);
  });
});
