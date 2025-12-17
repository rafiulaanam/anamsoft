import { computeProjectHealth } from "@/lib/project-health";

describe("computeProjectHealth", () => {
  it("marks overdue when deadline passed", () => {
    const res = computeProjectHealth({
      status: "DESIGN",
      startDate: new Date(Date.now() - 10 * 86400000),
      deadline: new Date(Date.now() - 1 * 86400000),
      reqDonePct: 50,
    });
    expect(res.health).toBe("OVERDUE");
    expect(res.reasons[0]).toMatch(/Deadline passed/);
  });

  it("at risk when deadline near and low progress", () => {
    const res = computeProjectHealth({
      status: "DESIGN",
      startDate: new Date(),
      deadline: new Date(Date.now() + 5 * 86400000),
      reqDonePct: 40,
    });
    expect(res.health).toBe("AT_RISK");
  });

  it("at risk when SPI under warn threshold", () => {
    const res = computeProjectHealth({
      status: "DESIGN",
      startDate: new Date(Date.now() - 10 * 86400000),
      deadline: new Date(Date.now() + 10 * 86400000),
      reqDonePct: 10,
    });
    expect(res.health).toBe("AT_RISK");
  });

  it("overdue when multiple severe signals combine", () => {
    const res = computeProjectHealth({
      status: "DESIGN",
      startDate: new Date(Date.now() - 10 * 86400000),
      deadline: new Date(Date.now() + 1 * 86400000),
      reqDonePct: 5,
      blockedTasksCount: 5,
      overdueMilestonesCount: 3,
    });
    expect(res.health).toBe("OVERDUE");
  });

  it("on track when no dates but no risks", () => {
    const res = computeProjectHealth({
      status: "DESIGN",
      reqDonePct: 0,
    });
    expect(res.health).toBe("ON_TRACK");
  });
});
