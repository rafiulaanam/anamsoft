export type ProjectHealth = "ON_TRACK" | "AT_RISK" | "OVERDUE";

export type HealthInput = {
  status: string;
  startDate?: string | Date | null;
  deadline?: string | Date | null;
  reqDonePct?: number;
  blockedTasksCount?: number;
  overdueMilestonesCount?: number;
  lastActivityAt?: string | Date | null;
  scopeGrowthPctLast7d?: number;
};

export type HealthResult = {
  health: ProjectHealth;
  score: number;
  reasons: string[];
};

export type HealthConfig = {
  warningWindowDays: number;
  criticalWindowDays: number;
  progressWarnPct: number;
  progressCriticalPct: number;
  spiWarn: number;
  spiCritical: number;
  staleWarnDays: number;
  staleCriticalDays: number;
};

const defaultConfig: HealthConfig = {
  warningWindowDays: 7,
  criticalWindowDays: 3,
  progressWarnPct: 80,
  progressCriticalPct: 90,
  spiWarn: 0.95,
  spiCritical: 0.85,
  staleWarnDays: 7,
  staleCriticalDays: 14,
};

function daysDiff(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeProjectHealth(input: HealthInput, config: HealthConfig = defaultConfig): HealthResult {
  const now = new Date();
  const deadlineDate = input.deadline ? new Date(input.deadline) : null;
  const startDate = input.startDate ? new Date(input.startDate) : null;
  const lastActivityAt = input.lastActivityAt ? new Date(input.lastActivityAt) : null;

  const reqDonePct = input.reqDonePct ?? 0;
  const blockedTasksCount = input.blockedTasksCount ?? 0;
  const overdueMilestonesCount = input.overdueMilestonesCount ?? 0;
  const scopeGrowthPctLast7d = input.scopeGrowthPctLast7d ?? 0;

  let score = 0;
  const reasons: Array<{ weight: number; message: string }> = [];

  // A) Time risk
  if (deadlineDate) {
    const daysToDeadline = daysDiff(deadlineDate, now);
    if (daysToDeadline < 0) {
      return { health: "OVERDUE", score: 10, reasons: ["Deadline passed"] };
    }
    if (daysToDeadline <= config.criticalWindowDays && reqDonePct < config.progressCriticalPct) {
      score += 4;
      reasons.push({ weight: 4, message: `Deadline in ${daysToDeadline}d; progress ${reqDonePct}% < ${config.progressCriticalPct}%` });
    } else if (daysToDeadline <= config.warningWindowDays && reqDonePct < config.progressWarnPct) {
      score += 3;
      reasons.push({ weight: 3, message: `Deadline in ${daysToDeadline}d; progress ${reqDonePct}% < ${config.progressWarnPct}%` });
    }
  }

  // B) Schedule performance (SPI)
  if (deadlineDate && startDate) {
    const plannedDays = Math.max(1, daysDiff(deadlineDate, startDate));
    const elapsedDays = Math.min(Math.max(0, daysDiff(now, startDate)), plannedDays);
    const pv = plannedDays ? elapsedDays / plannedDays : 0;
    const ev = reqDonePct / 100;
    const spi = ev / Math.max(pv, 0.05);
    if (spi < config.spiCritical) {
      score += 3;
      reasons.push({ weight: 3, message: `Behind schedule (SPI ${spi.toFixed(2)} < ${config.spiCritical})` });
    } else if (spi < config.spiWarn) {
      score += 2;
      reasons.push({ weight: 2, message: `Behind schedule (SPI ${spi.toFixed(2)} < ${config.spiWarn})` });
    }
  }

  // C) Delivery flow risk
  if (blockedTasksCount >= 5) {
    score += 3;
    reasons.push({ weight: 3, message: `Blocked tasks: ${blockedTasksCount}` });
  } else if (blockedTasksCount >= 2) {
    score += 2;
    reasons.push({ weight: 2, message: `Blocked tasks: ${blockedTasksCount}` });
  }

  // D) Milestone risk
  if (overdueMilestonesCount >= 3) {
    score += 3;
    reasons.push({ weight: 3, message: `Overdue milestones: ${overdueMilestonesCount}` });
  } else if (overdueMilestonesCount >= 1) {
    score += 2;
    reasons.push({ weight: 2, message: `Overdue milestones: ${overdueMilestonesCount}` });
  }

  // E) Staleness
  if (lastActivityAt) {
    const daysStale = daysDiff(now, lastActivityAt);
    if (daysStale >= config.staleCriticalDays) {
      score += 2;
      reasons.push({ weight: 2, message: `No activity for ${daysStale}d` });
    } else if (daysStale >= config.staleWarnDays && input.status !== "DEPLOYED") {
      score += 1;
      reasons.push({ weight: 1, message: `No activity for ${daysStale}d` });
    }
  }

  // F) Scope creep
  if (scopeGrowthPctLast7d >= 20) {
    score += 3;
    reasons.push({ weight: 3, message: `Scope grew ${scopeGrowthPctLast7d}% last 7d` });
  } else if (scopeGrowthPctLast7d >= 10) {
    score += 2;
    reasons.push({ weight: 2, message: `Scope grew ${scopeGrowthPctLast7d}% last 7d` });
  }

  let health: ProjectHealth = "ON_TRACK";
  if (score >= 6) health = "OVERDUE";
  else if (score >= 3) health = "AT_RISK";

  const topReasons = reasons.sort((a, b) => b.weight - a.weight).slice(0, 3).map((r) => r.message);

  return { health, score, reasons: topReasons };
}
