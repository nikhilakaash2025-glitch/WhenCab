import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seed script running: No dummy data injected.");
  
  // You can keep these here. If you ever want to completely wipe your database 
  // clean during testing, you can uncomment these lines!
  
  /*
  await db.ride.deleteMany();
  await db.user.deleteMany();
  console.log("Database wiped clean.");
  */
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
