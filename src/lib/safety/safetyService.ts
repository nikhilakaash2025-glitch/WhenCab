import { db } from "@/lib/db";
import { ReportReason } from "@prisma/client";

export async function reportUser(
  reporterId: string,
  reportedUserId: string,
  reason: ReportReason,
  details?: string
) {
  if (reporterId === reportedUserId) {
    throw new Error("Cannot report yourself");
  }

  return db.report.create({
    data: {
      reporterId,
      reportedUserId,
      reason,
      details: details?.trim().slice(0, 500) || null,
    },
  });
}

export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) {
    throw new Error("Cannot block yourself");
  }

  return db.block.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    update: {},
    create: { blockerId, blockedId },
  });
}

export async function unblockUser(blockerId: string, blockedId: string) {
  return db.block.deleteMany({ where: { blockerId, blockedId } });
}

export async function getBlockedUsers(blockerId: string) {
  return db.block.findMany({
    where: { blockerId },
    include: { blocked: { select: { id: true, name: true } } },
  });
}
