import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hash(pw, 12);

async function main() {
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.socialPost.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.department.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.alumniProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.college.deleteMany();

  const college = await prisma.college.create({
    data: {
      name: "Presbyterian Boys' Senior High School, Legon",
      description:
        "PRESEC — one of Ghana's premier secondary schools, founded in 1938. Home to Ɔdadeɛ across generations.",
      location: "Legon, Accra, Ghana",
      establishedYear: 1938,
    },
  });

  for (const name of [
    "General Science",
    "General Arts",
    "Business",
    "Visual Arts",
    "Home Economics",
    "General Agriculture",
  ]) {
    await prisma.department.create({ data: { collegeId: college.id, name } });
  }

  const superAdmin = await prisma.user.create({
    data: {
      fullName: "Kofi Mensah",
      email: "admin@inlumine.presec.edu.gh",
      passwordHash: await hash("Admin123!"),
      role: Role.SUPER_ADMIN,
      phone: "+233 24 000 0001",
    },
  });

  const systemUser = await prisma.user.create({
    data: {
      fullName: "Ama Darko",
      email: "staff@inlumine.presec.edu.gh",
      passwordHash: await hash("Staff123!"),
      role: Role.SYSTEM_USER,
      phone: "+233 24 000 0002",
    },
  });

  const alumniData = [
    { name: "Kwabena Owusu", email: "kwabena@example.com", year: 2014, dept: "General Science", company: "Google", title: "Software Engineer", location: "Accra", verified: true },
    { name: "Abena Serwaa", email: "abena@example.com", year: 2012, dept: "General Arts", company: "Deloitte", title: "Consultant", location: "London", verified: true },
    { name: "Yaw Boateng", email: "yaw@example.com", year: 2018, dept: "Business", company: "MTN Ghana", title: "Product Manager", location: "Accra", verified: true },
    { name: "Efua Adom", email: "efua@example.com", year: 2016, dept: "General Science", company: "Korle Bu Teaching Hospital", title: "Resident Doctor", location: "Accra", verified: false },
    { name: "Kojo Asante", email: "kojo@example.com", year: 2010, dept: "General Science", company: "Self-employed", title: "Entrepreneur", location: "Kumasi", verified: true },
  ];

  const alumniUsers = [];
  for (const a of alumniData) {
    const user = await prisma.user.create({
      data: {
        fullName: a.name,
        email: a.email,
        passwordHash: await hash("Alumni123!"),
        role: Role.COLLEGE_MATE,
        alumniProfile: {
          create: {
            graduationYear: a.year,
            department: a.dept,
            currentCompany: a.company,
            jobTitle: a.title,
            location: a.location,
            bio: `Ɔdadeɛ Class of ${a.year}. Proud PRESEC alumnus.`,
            isVerified: a.verified,
            visibility: "ALUMNI_ONLY",
          },
        },
      },
    });
    alumniUsers.push(user);
  }

  const student = await prisma.user.create({
    data: {
      fullName: "Daniel Ofori",
      email: "student@example.com",
      passwordHash: await hash("Student123!"),
      role: Role.STUDENT,
      studentProfile: {
        create: {
          department: "General Science",
          enrollmentYear: 2022,
          expectedGraduationYear: 2025,
          bio: "Current PRESEC student exploring career paths in engineering.",
        },
      },
    },
  });

  await prisma.connection.createMany({
    data: [
      { requesterId: alumniUsers[0].id, recipientId: alumniUsers[1].id, status: "ACCEPTED" },
      { requesterId: alumniUsers[2].id, recipientId: alumniUsers[0].id, status: "PENDING" },
    ],
  });

  await prisma.opportunity.createMany({
    data: [
      {
        postedBy: alumniUsers[0].id,
        type: "JOB",
        title: "Software Engineer — Backend",
        description: "Looking for a PRESEC alumnus to join our Accra engineering team. 3+ years experience with Node.js or Python.",
        company: "Google Ghana",
        location: "Accra",
        department: "General Science",
        status: "APPROVED",
      },
      {
        postedBy: alumniUsers[1].id,
        type: "INTERNSHIP",
        title: "Summer Consulting Internship",
        description: "Deloitte Ghana is accepting applications from current students and recent graduates.",
        company: "Deloitte",
        location: "Accra",
        department: "Business",
        status: "APPROVED",
      },
      {
        postedBy: alumniUsers[4].id,
        type: "MENTORSHIP",
        title: "Entrepreneurship mentorship",
        description: "Monthly sessions for Ɔdadeɛ interested in starting their own business in Ghana.",
        company: "Kojo Asante Ventures",
        location: "Kumasi",
        status: "PENDING",
      },
    ],
  });

  await prisma.announcement.createMany({
    data: [
      {
        collegeId: college.id,
        title: "Annual Ɔdadeɛ Homecoming 2026",
        content: "Mark your calendars — the 2026 homecoming weekend runs 14–16 August on the Legon campus. Registration opens in May.",
        postedBy: systemUser.id,
      },
      {
        collegeId: college.id,
        title: "New InLumine platform launch",
        content: "PRESEC alumni can now connect, share opportunities, and stay in touch through InLumine — our official alumni network.",
        postedBy: superAdmin.id,
      },
    ],
  });

  const post1 = await prisma.socialPost.create({
    data: {
      authorId: alumniUsers[0].id,
      content: "Great seeing so many Ɔdadeɛ at the Legon homecoming last month. Who else was there?",
      visibility: "PUBLIC",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: alumniUsers[1].id,
      content: "Was there! Already looking forward to next year.",
    },
  });

  await prisma.postLike.create({
    data: { postId: post1.id, userId: alumniUsers[2].id },
  });

  await prisma.socialPost.create({
    data: {
      authorId: alumniUsers[4].id,
      content: "Just opened a new office in Kumasi. Always happy to connect with fellow PRESEC entrepreneurs.",
      visibility: "ALUMNI_ONLY",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: superAdmin.id,
      action: "SEED_DATABASE",
      targetType: "System",
      targetId: "initial",
    },
  });

  console.log("Seed complete.");
  console.log("\nDemo accounts:");
  console.log("  Super Admin:  admin@inlumine.presec.edu.gh / Admin123!");
  console.log("  System User:  staff@inlumine.presec.edu.gh / Staff123!");
  console.log("  Alumni:       kwabena@example.com / Alumni123!");
  console.log("  Student:      student@example.com / Student123!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
