import { PrismaClient, PostType, RideStatus } from "@prisma/client";

const db = new PrismaClient();

const students = [
  { name: "Aarav Sharma", email: "aarav.sharma2022@vitstudent.ac.in", phoneNumber: "9876543210" },
  { name: "Diya Patel", email: "diya.patel2022@vitstudent.ac.in", phoneNumber: "9876543211" },
  { name: "Rohan Mehta", email: "rohan.mehta2023@vitstudent.ac.in", phoneNumber: "9876543212" },
  { name: "Ishita Rao", email: "ishita.rao2023@vitstudent.ac.in", phoneNumber: "9876543213" },
  { name: "Kabir Singh", email: "kabir.singh2021@vitstudent.ac.in", phoneNumber: "9876543214" },
];

const destinations = [
  "Chennai Airport (MAA)",
  "Bangalore Airport (KIA)",
  "Katpadi Railway Station",
  "Chennai Central Railway Station",
];

function daysFromNow(days: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding database...");

  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.report.deleteMany();
  await db.block.deleteMany();
  await db.ride.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.user.deleteMany();

  const users = await Promise.all(students.map((s) => db.user.create({ data: s })));

  const rides = await Promise.all([
    db.ride.create({
      data: {
        userId: users[0].id,
        destination: destinations[0],
        travelDateTime: daysFromNow(5, 18),
        availableSeats: 3,
        totalFare: 200,
        postType: PostType.HAVE_CAB,
        status: RideStatus.ACTIVE,
      },
    }),
    db.ride.create({
      data: {
        userId: users[1].id,
        destination: destinations[1],
        travelDateTime: daysFromNow(5, 19),
        availableSeats: 1,
        totalFare: 350,
        postType: PostType.NEED_CAB,
        status: RideStatus.ACTIVE,
      },
    }),
    db.ride.create({
      data: {
        userId: users[2].id,
        destination: destinations[2],
        travelDateTime: daysFromNow(6, 8),
        availableSeats: 2,
        totalFare: 100,
        postType: PostType.HAVE_CAB,
        status: RideStatus.ACTIVE,
      },
    }),
    db.ride.create({
      data: {
        userId: users[3].id,
        destination: destinations[0],
        travelDateTime: daysFromNow(5, 17),
        availableSeats: 1,
        totalFare: 250,
        postType: PostType.NEED_CAB,
        status: RideStatus.ACTIVE,
      },
    }),
    db.ride.create({
      data: {
        userId: users[4].id,
        destination: destinations[3],
        travelDateTime: daysFromNow(-1, 10),
        availableSeats: 2,
        totalFare: 150,
        postType: PostType.HAVE_CAB,
        status: RideStatus.ACTIVE, // intentionally past — verifies the expiration cron
      },
    }),
  ]);

  console.log(`Seeded ${users.length} users and ${rides.length} rides.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
