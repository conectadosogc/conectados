export type DashboardStat = {
  label: string;
  value: number;
  trend: string;
  accent: "indigo" | "mustard";
};

export type CoordinatorItem = {
  id: string;
  code: string;
  fullName: string;
  zone: string;
  province?: string | null;
  municipality?: string | null;
  neighborhood?: string | null;
  targetMembers: number;
  dirigenteCount: number;
  memberCount: number;
};

export type DirigenteItem = {
  id: string;
  code: string;
  fullName: string;
  zone: string;
  province?: string | null;
  municipality?: string | null;
  neighborhood?: string | null;
  coordinatorName: string;
  memberCount: number;
};

export type MemberItem = {
  id: string;
  code: string;
  fullName: string;
  zone: string;
  province?: string | null;
  municipality?: string | null;
  neighborhood?: string | null;
  dirigenteName: string;
};

export type EventItem = {
  id: string;
  title: string;
  description: string;
  status: "Pendiente" | "En progreso" | "Completado" | "Cancelado";
  scheduledFor: string;
  location: string;
};

export type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Activo" | "Inactivo";
  lastLogin: string;
  avatarUrl?: string | null;
  phone?: string | null;
  title?: string | null;
  bio?: string | null;
};

export type OrganizationProfileItem = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  taxId: string;
  fullAddress: string;
  employeeCount: number | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  extraAddress: string | null;
  legalRepresentativeName: string | null;
  legalRepresentativeId: string | null;
  companyType: string | null;
  website: string | null;
  publicEmail: string | null;
  publicNotes: string | null;
};

export const demoCoordinators: CoordinatorItem[] = [
  {
    id: "coord-1",
    code: "CRD-8BEUUV2E",
    fullName: "George Perez",
    zone: "Santo Domingo / Santo Domingo Este / Alma Rosa",
    province: "Santo Domingo",
    municipality: "Santo Domingo Este",
    neighborhood: "Alma Rosa",
    targetMembers: 25,
    dirigenteCount: 0,
    memberCount: 0,
  },
  {
    id: "coord-2",
    code: "CRD-CUE2LRNE",
    fullName: "Juan Perez",
    zone: "Distrito Nacional / Santo Domingo de Guzman / Bella Vista",
    province: "Distrito Nacional",
    municipality: "Santo Domingo de Guzman",
    neighborhood: "Bella Vista",
    targetMembers: 18,
    dirigenteCount: 1,
    memberCount: 2,
  },
  {
    id: "coord-3",
    code: "CRD-NX05SRDB",
    fullName: "Doe Matos",
    zone: "Santiago / Santiago / Villa Olga",
    province: "Santiago",
    municipality: "Santiago",
    neighborhood: "Villa Olga",
    targetMembers: 20,
    dirigenteCount: 2,
    memberCount: 3,
  },
  {
    id: "coord-4",
    code: "CRD-W0SHSLN2",
    fullName: "Ismael Aybar",
    zone: "La Altagracia / Higuey / Savica",
    province: "La Altagracia",
    municipality: "Higuey",
    neighborhood: "Savica",
    targetMembers: 16,
    dirigenteCount: 0,
    memberCount: 0,
  },
];

export const demoDirigentes: DirigenteItem[] = [
  {
    id: "dir-1",
    code: "DRG-VGWIRTWF",
    fullName: "Nicanor Garcia",
    zone: "Distrito Nacional / Santo Domingo de Guzman / Bella Vista",
    province: "Distrito Nacional",
    municipality: "Santo Domingo de Guzman",
    neighborhood: "Bella Vista",
    coordinatorName: "Juan Perez",
    memberCount: 2,
  },
  {
    id: "dir-2",
    code: "DRG-M4K0UQFJ",
    fullName: "Honh Matos",
    zone: "Santiago / Santiago / Villa Olga",
    province: "Santiago",
    municipality: "Santiago",
    neighborhood: "Villa Olga",
    coordinatorName: "Doe Matos",
    memberCount: 3,
  },
  {
    id: "dir-3",
    code: "DRG-MICZB6SZ",
    fullName: "Honh Matos",
    zone: "Santiago / Santiago / Los Jardines Metropolitanos",
    province: "Santiago",
    municipality: "Santiago",
    neighborhood: "Los Jardines Metropolitanos",
    coordinatorName: "Doe Matos",
    memberCount: 0,
  },
];

export const demoMembers: MemberItem[] = [
  {
    id: "mem-1",
    code: "MBR-1PWBICS",
    fullName: "El Pepe",
    zone: "Santiago / Santiago / Villa Olga",
    province: "Santiago",
    municipality: "Santiago",
    neighborhood: "Villa Olga",
    dirigenteName: "Honh Matos",
  },
  {
    id: "mem-2",
    code: "MBR-QPDHYXK0",
    fullName: "Victoe Perez E",
    zone: "Santiago / Santiago / Villa Olga",
    province: "Santiago",
    municipality: "Santiago",
    neighborhood: "Villa Olga",
    dirigenteName: "Honh Matos",
  },
  {
    id: "mem-3",
    code: "MBR-HCZQPBRN",
    fullName: "Ismael Q",
    zone: "Distrito Nacional / Santo Domingo de Guzman / Bella Vista",
    province: "Distrito Nacional",
    municipality: "Santo Domingo de Guzman",
    neighborhood: "Bella Vista",
    dirigenteName: "Nicanor Garcia",
  },
  {
    id: "mem-4",
    code: "MBR-ZCKEFYAE",
    fullName: "Misael Michel",
    zone: "Distrito Nacional / Santo Domingo de Guzman / Bella Vista",
    province: "Distrito Nacional",
    municipality: "Santo Domingo de Guzman",
    neighborhood: "Bella Vista",
    dirigenteName: "Nicanor Garcia",
  },
  {
    id: "mem-5",
    code: "MBR-J0440B7B",
    fullName: "Honh Matos",
    zone: "Santiago / Santiago / Villa Olga",
    province: "Santiago",
    municipality: "Santiago",
    neighborhood: "Villa Olga",
    dirigenteName: "Honh Matos",
  },
];

export const demoEvents: EventItem[] = [
  {
    id: "event-1",
    title: "Encuentro territorial",
    description: "Revisión de avances con coordinadores y plan operativo del mes.",
    status: "Pendiente",
    scheduledFor: "16 Ago 2026",
    location: "Centro de coordinación - Este",
  },
];

export const demoUsers: UserItem[] = [
  {
    id: "user-1",
    name: "Administrador General",
    email: "admin@conectados.local",
    role: "Administrador",
    status: "Activo",
    lastLogin: "12 Ago 2026",
    title: "Administracion general",
  },
  {
    id: "user-2",
    name: "George Perez",
    email: "george@conectados.local",
    role: "Coordinador",
    status: "Activo",
    lastLogin: "12 Ago 2026",
    title: "Coordinacion territorial",
  },
  {
    id: "user-3",
    name: "Nicanor Garcia",
    email: "nicanor@conectados.local",
    role: "Dirigente",
    status: "Activo",
    lastLogin: "Sin ingreso",
    title: "Dirigencia operativa",
  },
];

export const demoOrganizationProfile: OrganizationProfileItem = {
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
  publicNotes:
    "Plataforma interna para organización territorial, crecimiento de estructura y trazabilidad de eventos.",
};
