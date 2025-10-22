import { beforeEach, describe, expect, it, vi } from "vitest";

import { container } from "../src/container";
import { http } from "./setup/testServer";

describe("Nutrition routes", () => {
  beforeEach(() => {
    process.env.NUTRITION_MODULE_ENABLED = "true";
    vi.restoreAllMocks();
  });

  it("creates a quick meal entry", async () => {
    vi.spyOn(container.repositories.nutrition, "addMeal").mockResolvedValue("meal-123");

    const response = await http()
      .post("/api/nutrition/meal")
      .send({
        childId: "child-1",
        date: "2025-10-20",
        period: "LUNCH",
        items: ["Arroz", "Verdura"],
        note: "Comeu tudo",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: "meal-123" });
  });

  it("rejects invalid meal payload", async () => {
    const response = await http()
      .post("/api/nutrition/meal")
      .send({
        childId: "",
        date: "2025-99-01",
        period: "INVALID",
        items: [],
      });

    expect(response.status).toBe(400);
  });

  it("returns week summary", async () => {
    vi.spyOn(container.repositories.nutrition, "getWeekSummary").mockResolvedValue({
      range: { start: "2025-10-13", end: "2025-10-19" },
      days: [],
      weeklyScore: 12,
      plan: [],
    });

    const response = await http().get("/api/nutrition/week?childId=child-1&start=2025-10-13");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ weeklyScore: 12 });
  });
});
