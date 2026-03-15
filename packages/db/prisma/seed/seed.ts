import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  await seedShopItems();
  await seedAdminUser();

  console.log("Database seeding completed successfully!");
}

async function seedShopItems() {
  console.log("Seeding shop items...");

  const starterPack = await prisma.shopItem.upsert({
    where: { id: "item_starter_pack" },
    update: {},
    create: {
      id: "item_starter_pack",
      name: "태자 스타터 팩",
      description: "새로운 사용자를 위한 기본 아이템 팩",
      category: "STARTER_PACK",
      price: 0,
      currency: "GEMS",
      imageUrl: "/images/shop/starter-pack.png",
      isAvailable: true,
    },
  });

  console.log(`Created starter pack: ${starterPack.id}`);

  const costumes = [
    {
      id: "item_costume_bear",
      name: "곰돌이 의상",
      description: "귀여운 곰돌이 캐릭터 의상",
      price: 500,
    },
    {
      id: "item_costume_cat",
      name: "고양이 의상",
      description: "세련된 고양이 캐릭터 의상",
      price: 500,
    },
    {
      id: "item_costume_rabbit",
      name: "토끼 의상",
      description: "사랑스러운 토끼 캐릭터 의상",
      price: 500,
    },
    {
      id: "item_costume_fox",
      name: "여우 의상",
      description: "매혹적인 여우 캐릭터 의상",
      price: 750,
      isLimited: true,
      limitedQuantity: 100,
    },
  ];

  for (const costume of costumes) {
    const item = await prisma.shopItem.upsert({
      where: { id: costume.id },
      update: {},
      create: {
        ...costume,
        category: "COSTUME",
        currency: "GEMS",
        imageUrl: `/images/shop/${costume.id}.png`,
        isAvailable: true,
        isLimited: costume.isLimited || false,
        limitedQuantity: costume.limitedQuantity || null,
      },
    });
    console.log(`Created costume: ${item.id}`);
  }

  const broadcastItems = [
    {
      id: "item_broadcast_normal",
      name: "일반 방송",
      description: "50자까지 광장에 방송 - 1분 유지",
      price: 100,
    },
    {
      id: "item_broadcast_premium",
      name: "프리미엄 방송",
      description: "100자까지 광장에 방송 - 5분 유지",
      price: 500,
    },
  ];

  for (const item of broadcastItems) {
    const shopItem = await prisma.shopItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        category: "BROADCAST_ITEM",
        currency: "POINTS",
        imageUrl: `/images/shop/${item.id}.png`,
        isAvailable: true,
      },
    });
    console.log(`Created broadcast item: ${shopItem.id}`);
  }

  const backgrounds = [
    {
      id: "item_bg_spring",
      name: "봄 배경",
      description: "따뜻한 봄의 느낌",
      price: 300,
    },
    {
      id: "item_bg_summer",
      name: "여름 배경",
      description: "시원한 여름의 느낌",
      price: 300,
    },
    {
      id: "item_bg_autumn",
      name: "가을 배경",
      description: "고즈넉한 가을의 느낌",
      price: 300,
    },
    {
      id: "item_bg_winter",
      name: "겨울 배경",
      description: "차가운 겨울의 느낌",
      price: 300,
    },
  ];

  for (const bg of backgrounds) {
    const item = await prisma.shopItem.upsert({
      where: { id: bg.id },
      update: {},
      create: {
        ...bg,
        category: "BACKGROUND",
        currency: "GEMS",
        imageUrl: `/images/shop/${bg.id}.png`,
        isAvailable: true,
      },
    });
    console.log(`Created background: ${item.id}`);
  }

  const furniture = [
    {
      id: "item_furniture_sofa",
      name: "소파",
      description: "편안한 소파",
      price: 200,
    },
    {
      id: "item_furniture_table",
      name: "테이블",
      description: "나무 테이블",
      price: 150,
    },
    {
      id: "item_furniture_bed",
      name: "침대",
      description: "편한 침대",
      price: 250,
    },
    {
      id: "item_furniture_plant",
      name: "화분",
      description: "예쁜 화분",
      price: 100,
    },
    {
      id: "item_furniture_lamp",
      name: "조명",
      description: "따뜻한 조명",
      price: 120,
    },
  ];

  for (const item of furniture) {
    const shopItem = await prisma.shopItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        category: "FURNITURE",
        currency: "POINTS",
        imageUrl: `/images/shop/${item.id}.png`,
        isAvailable: true,
      },
    });
    console.log(`Created furniture: ${shopItem.id}`);
  }
}

async function seedAdminUser() {
  console.log("Seeding admin user...");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@taeja.local" },
    update: {},
    create: {
      email: "admin@taeja.local",
      passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz",
      nickname: "태자마스터",
      nicknameNormalized: "태자마스터",
      nicknameChosung: "ㅌㅈㅁㅅ",
      avatarId: "avatar_admin",
      role: "ADMIN",
      status: "ACTIVE",
      gems: 999999,
      points: 999999,
      locale: "ko",
    },
  });

  console.log(`Created admin user: ${adminUser.id}`);

  const userProfile = await prisma.userProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      bio: "태자 월드의 관리자입니다.",
    },
  });

  console.log(`Created admin profile: ${userProfile.id}`);

  const minihome = await prisma.minihome.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      theme: "MODERN",
      visitCount: 0,
    },
  });

  console.log(`Created admin minihome: ${minihome.id}`);

  for (let i = 0; i < 4; i++) {
    await prisma.minihomeSlot.create({
      data: {
        minihomeId: minihome.id,
        slotIndex: i,
      },
    });
  }

  console.log("Admin minihome slots created");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
