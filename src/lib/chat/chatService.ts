import { db } from "@/lib/db";

function sortUserIds(idA: string, idB: string): [string, string] {
  return idA < idB ? [idA, idB] : [idB, idA];
}

async function assertNotBlocked(userAId: string, userBId: string) {
  const block = await db.block.findFirst({
    where: {
      OR: [
        { blockerId: userAId, blockedId: userBId },
        { blockerId: userBId, blockedId: userAId },
      ],
    },
  });
  if (block) {
    throw new Error("Cannot message this user");
  }
}

export async function getOrCreateConversation(rideId: string, requesterId: string) {
  const ride = await db.ride.findUnique({ where: { id: rideId }, select: { userId: true } });
  if (!ride) throw new Error("Ride not found");
  if (ride.userId === requesterId) throw new Error("Cannot start a conversation with yourself");

  await assertNotBlocked(ride.userId, requesterId);

  const [userAId, userBId] = sortUserIds(ride.userId, requesterId);

  return db.conversation.upsert({
    where: { rideId_userAId_userBId: { rideId, userAId, userBId } },
    update: {},
    create: { rideId, userAId, userBId },
    include: {
      ride: { select: { destination: true, travelDateTime: true, postType: true } },
      userA: { select: { id: true, name: true } },
      userB: { select: { id: true, name: true } },
    },
  });
}

export async function getUserConversations(userId: string) {
  const blocks = await db.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const blockedUserIds = new Set(
    blocks.map((b) => (b.blockerId === userId ? b.blockedId : b.blockerId))
  );

  const conversations = await db.conversation.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    include: {
      ride: { select: { destination: true, travelDateTime: true, postType: true } },
      userA: { select: { id: true, name: true } },
      userB: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return conversations.filter((c) => {
    const otherId = c.userAId === userId ? c.userBId : c.userAId;
    return !blockedUserIds.has(otherId);
  });
}

async function assertParticipant(conversationId: string, userId: string) {
  const convo = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { userAId: true, userBId: true },
  });
  if (!convo || (convo.userAId !== userId && convo.userBId !== userId)) {
    throw new Error("Not a participant in this conversation");
  }
  return convo;
}

export async function getMessages(conversationId: string, userId: string) {
  await assertParticipant(conversationId, userId);

  return db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true } } },
  });
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const convo = await assertParticipant(conversationId, senderId);

  const otherUserId = convo.userAId === senderId ? convo.userBId : convo.userAId;
  await assertNotBlocked(senderId, otherUserId);

  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message cannot be empty");
  if (trimmed.length > 1000) throw new Error("Message too long");

  const [message] = await db.$transaction([
    db.message.create({
      data: { conversationId, senderId, content: trimmed },
      include: { sender: { select: { id: true, name: true } } },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return message;
}
