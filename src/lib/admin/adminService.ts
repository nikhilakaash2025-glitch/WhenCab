import { db } from "@/lib/db";

export async function listPendingReports() {
  return db.report.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      reportedUser: { select: { id: true, name: true, email: true, isSuspended: true } },
    },
  });
}

export async function listReportHistory() {
  return db.report.findMany({
    where: { status: { in: ["ACTIONED", "DISMISSED"] } },
    orderBy: { reviewedAt: "desc" },
    take: 50,
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      reportedUser: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getReportContext(reportId: string) {
  const report = await db.report.findUnique({
    where: { id: reportId },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      reportedUser: {
        select: { id: true, name: true, email: true, isSuspended: true, createdAt: true },
      },
    },
  });
  if (!report) throw new Error("Report not found");

  const [priorReports, recentRides] = await Promise.all([
    db.report.findMany({
      where: { reportedUserId: report.reportedUserId, id: { not: reportId } },
      orderBy: { createdAt: "desc" },
      select: { id: true, reason: true, status: true, createdAt: true },
    }),
    db.ride.findMany({
      where: { userId: report.reportedUserId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, destination: true, travelDateTime: true, status: true, postType: true },
    }),
  ]);

  return { report, priorReports, recentRides };
}

export async function actionReport(reportId: string, adminEmail: string, reason?: string) {
  const report = await db.report.findUnique({ where: { id: reportId } });
  if (!report) throw new Error("Report not found");
  if (report.status !== "PENDING") throw new Error("Report already reviewed");

  await db.$transaction([
    db.user.update({
      where: { id: report.reportedUserId },
      data: {
        isSuspended: true,
        suspendedAt: new Date(),
        suspendedReason: reason?.trim().slice(0, 300) || `Report: ${report.reason}`,
      },
    }),
    db.ride.updateMany({
      where: { userId: report.reportedUserId, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    }),
    db.report.update({
      where: { id: reportId },
      data: { status: "ACTIONED", reviewedAt: new Date(), reviewedById: adminEmail },
    }),
    db.report.updateMany({
      where: { reportedUserId: report.reportedUserId, status: "PENDING", id: { not: reportId } },
      data: { status: "DISMISSED", reviewedAt: new Date(), reviewedById: adminEmail },
    }),
  ]);
}

export async function dismissReport(reportId: string, adminEmail: string) {
  const report = await db.report.findUnique({ where: { id: reportId } });
  if (!report) throw new Error("Report not found");
  if (report.status !== "PENDING") throw new Error("Report already reviewed");

  await db.report.update({
    where: { id: reportId },
    data: { status: "DISMISSED", reviewedAt: new Date(), reviewedById: adminEmail },
  });
}

export async function unsuspendUser(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { isSuspended: false, suspendedAt: null, suspendedReason: null },
  });
}

export async function listSuspendedUsers() {
  return db.user.findMany({
    where: { isSuspended: true },
    orderBy: { suspendedAt: "desc" },
    select: { id: true, name: true, email: true, suspendedAt: true, suspendedReason: true },
  });
}
