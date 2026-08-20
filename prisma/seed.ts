import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, EventStatus, UserRole } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const defaultPasswordHash = await hashPassword("conectados");

  await prisma.member.deleteMany();
  await prisma.dirigente.deleteMany();
  await prisma.event.deleteMany();
  await prisma.coordinator.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organizationProfile.deleteMany();

  const coordinators = await Promise.all([
    prisma.coordinator.create({
      data: {
        code: "CRD-8BEUUV2E",
        fullName: "George Perez",
        email: "george@conectados.local",
        phone: "+1 809 701 0101",
        zone: "Santo Domingo / Santo Domingo Este / Alma Rosa",
        province: "Santo Domingo",
        municipality: "Santo Domingo Este",
        neighborhood: "Alma Rosa",
        targetMembers: 25,
      } as never,
    }),
    prisma.coordinator.create({
      data: {
        code: "CRD-CUE2LRNE",
        fullName: "Juan Perez",
        email: "juan@conectados.local",
        phone: "+1 829 702 0202",
        zone: "Distrito Nacional / Santo Domingo de Guzmán / Bella Vista",
        province: "Distrito Nacional",
        municipality: "Santo Domingo de Guzmán",
        neighborhood: "Bella Vista",
        targetMembers: 18,
      } as never,
    }),
    prisma.coordinator.create({
      data: {
        code: "CRD-NX05SRDB",
        fullName: "Doe Matos",
        email: "doe@conectados.local",
        phone: "+1 849 703 0303",
        zone: "Santiago / Santiago / Villa Olga",
        province: "Santiago",
        municipality: "Santiago",
        neighborhood: "Villa Olga",
        targetMembers: 20,
      } as never,
    }),
    prisma.coordinator.create({
      data: {
        code: "CRD-W0SHSLN2",
        fullName: "Ismael Aybar",
        email: "ismael@conectados.local",
        phone: "+1 809 704 0404",
        zone: "La Altagracia / Higüey / Savica",
        province: "La Altagracia",
        municipality: "Higüey",
        neighborhood: "Savica",
        targetMembers: 16,
      } as never,
    }),
  ]);

  const dirigentes = await Promise.all([
    prisma.dirigente.create({
      data: {
        code: "DRG-VGWIRTWF",
        fullName: "Nicanor Garcia",
        zone: "Distrito Nacional / Santo Domingo de Guzmán / Bella Vista",
        province: "Distrito Nacional",
        municipality: "Santo Domingo de Guzmán",
        neighborhood: "Bella Vista",
        coordinatorId: coordinators[1].id,
      } as never,
    }),
    prisma.dirigente.create({
      data: {
        code: "DRG-M4K0UQFJ",
        fullName: "Honh Matos",
        zone: "Santiago / Santiago / Villa Olga",
        province: "Santiago",
        municipality: "Santiago",
        neighborhood: "Villa Olga",
        coordinatorId: coordinators[2].id,
      } as never,
    }),
    prisma.dirigente.create({
      data: {
        code: "DRG-MICZB6SZ",
        fullName: "Honh Matos",
        zone: "Santiago / Santiago / Los Jardines Metropolitanos",
        province: "Santiago",
        municipality: "Santiago",
        neighborhood: "Los Jardines Metropolitanos",
        coordinatorId: coordinators[2].id,
      } as never,
    }),
  ]);

  await Promise.all([
    prisma.member.create({
      data: {
        code: "MBR-1PWBICS",
        fullName: "El Pepe",
        zone: "Santiago / Santiago / Villa Olga",
        province: "Santiago",
        municipality: "Santiago",
        neighborhood: "Villa Olga",
        dirigenteId: dirigentes[1].id,
      } as never,
    }),
    prisma.member.create({
      data: {
        code: "MBR-QPDHYXK0",
        fullName: "Victoe Perez E",
        zone: "Santiago / Santiago / Villa Olga",
        province: "Santiago",
        municipality: "Santiago",
        neighborhood: "Villa Olga",
        dirigenteId: dirigentes[1].id,
      } as never,
    }),
    prisma.member.create({
      data: {
        code: "MBR-HCZQPBRN",
        fullName: "Ismael Q",
        zone: "Distrito Nacional / Santo Domingo de Guzmán / Bella Vista",
        province: "Distrito Nacional",
        municipality: "Santo Domingo de Guzmán",
        neighborhood: "Bella Vista",
        dirigenteId: dirigentes[0].id,
      } as never,
    }),
    prisma.member.create({
      data: {
        code: "MBR-ZCKEFYAE",
        fullName: "Misael Michel",
        zone: "Distrito Nacional / Santo Domingo de Guzmán / Bella Vista",
        province: "Distrito Nacional",
        municipality: "Santo Domingo de Guzmán",
        neighborhood: "Bella Vista",
        dirigenteId: dirigentes[0].id,
      } as never,
    }),
    prisma.member.create({
      data: {
        code: "MBR-J0440B7B",
        fullName: "Honh Matos",
        zone: "Santiago / Santiago / Villa Olga",
        province: "Santiago",
        municipality: "Santiago",
        neighborhood: "Villa Olga",
        dirigenteId: dirigentes[1].id,
      } as never,
    }),
  ]);

  await prisma.event.create({
    data: {
      title: "Encuentro territorial",
      description: "Revisión de avances con coordinadores y plan operativo del mes.",
      status: EventStatus.PENDING,
      scheduledFor: new Date("2026-08-16T17:00:00.000Z"),
      location: "Centro de coordinación - Este",
      coordinatorId: coordinators[1].id,
    },
  });

  await Promise.all([
    prisma.user.create({
      data: {
        name: "Administrador General",
        email: "admin@conectados.local",
        title: "Administracion general",
        phone: "+591 70010001",
        bio: "Gestion integral de la plataforma y de la estructura interna.",
        passwordHash: defaultPasswordHash,
        role: UserRole.ADMIN,
        isActive: true,
        lastLoginAt: new Date("2026-08-12T21:40:00.000Z"),
      },
    }),
    prisma.user.create({
      data: {
        name: "George Perez",
        email: "george@conectados.local",
        title: "Coordinacion territorial",
        phone: "+591 70010002",
        bio: "Seguimiento de estructura y operacion de la zona Este.",
        passwordHash: defaultPasswordHash,
        role: UserRole.COORDINATOR,
        isActive: true,
        lastLoginAt: new Date("2026-08-12T20:05:00.000Z"),
      },
    }),
    prisma.user.create({
      data: {
        name: "Nicanor Garcia",
        email: "nicanor@conectados.local",
        title: "Dirigencia operativa",
        phone: "+591 70010003",
        bio: "Supervision de miembros y coordinacion de actividades de campo.",
        passwordHash: defaultPasswordHash,
        role: UserRole.DIRIGENTE,
        isActive: true,
      },
    }),
  ]);

  await prisma.organizationProfile.create({
    data: {
      businessName: "Conectados",
      businessEmail: "info@conectados.local",
      businessPhone: "+591 (3) 456-7890",
      taxId: "000-000000-0",
      fullAddress: "Av. Principal 245, Zona Norte, Santa Cruz",
      employeeCount: 15,
      contactName: "Administración Conectados",
      contactEmail: "contacto@conectados.local",
      contactPhone: "+591 70000000",
      extraAddress: "Oficina 2B, edificio central",
      legalRepresentativeName: "Nombre y Apellido",
      legalRepresentativeId: "12345678",
      companyType: "Asociación civil",
      website: "https://conectados.local",
      publicEmail: "publico@conectados.local",
      publicNotes: "Plataforma interna para organización territorial y seguimiento de estructura.",
    },
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
