import { type NextRequest } from "next/server";

import { getSessionUser } from "@/lib/auth";
import {
  getAccessRequestRecords,
  getCoordinatorRecords,
  getDirigenteRecords,
  getEventRecords,
  getMemberRecords,
  getUserRecords,
} from "@/lib/data";
import { toCsv } from "@/lib/export";
import { canAccessRoute } from "@/lib/permissions";

export const dynamic = "force-dynamic";

type ExportKind = "coordinadores" | "dirigentes" | "miembros" | "eventos" | "usuarios";

const kindToRoute: Record<ExportKind, string> = {
  coordinadores: "/coordinadores",
  dirigentes: "/dirigentes",
  miembros: "/miembros",
  eventos: "/eventos",
  usuarios: "/usuarios",
};

export async function GET(
  request: NextRequest,
  context: RouteContext<"/export/[kind]">,
) {
  const { kind } = await context.params;
  if (!isExportKind(kind)) {
    return new Response("Exportacion no disponible.", { status: 404 });
  }

  const user = await getSessionUser();
  if (!user) {
    return new Response("Sesion no valida.", { status: 401 });
  }

  if (!canAccessRoute(user.role, kindToRoute[kind])) {
    return new Response("No autorizado.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const province = searchParams.get("province")?.trim() ?? "";
  const municipality = searchParams.get("municipality")?.trim() ?? "";
  const filters = {
    ...(query ? { query } : {}),
    ...(province ? { province } : {}),
    ...(municipality ? { municipality } : {}),
  };

  if (kind === "coordinadores") {
    const rows = (await getCoordinatorRecords(filters)).map((item) => ({
      codigo: item.code,
      nombre: item.fullName,
      correo: item.email,
      telefono: item.phone,
      provincia: item.province,
      municipio: item.municipality,
      barrio: item.neighborhood,
      zona: item.zone,
      meta_miembros: item.targetMembers,
      dirigentes: item.dirigenteCount,
      miembros: item.memberCount,
      notas: item.notes,
    }));
    return csvResponse(`coordinadores-${dateStamp()}.csv`, toCsv(rows));
  }

  if (kind === "dirigentes") {
    const rows = (await getDirigenteRecords(filters)).map((item) => ({
      codigo: item.code,
      nombre: item.fullName,
      correo: item.email,
      telefono: item.phone,
      coordinador: item.coordinatorName,
      provincia: item.province,
      municipio: item.municipality,
      barrio: item.neighborhood,
      zona: item.zone,
      miembros: item.memberCount,
    }));
    return csvResponse(`dirigentes-${dateStamp()}.csv`, toCsv(rows));
  }

  if (kind === "eventos") {
    const rows = (await getEventRecords(query)).map((item) => ({
      titulo: item.title,
      fecha: item.scheduledFor,
      estado: item.status,
      ubicacion: item.location,
      descripcion: item.description,
    }));
    return csvResponse(`eventos-${dateStamp()}.csv`, toCsv(rows));
  }

  if (kind === "usuarios") {
    const role = searchParams.get("role")?.trim() ?? "";
    const status = searchParams.get("status")?.trim() ?? "";
    const requestQuery = searchParams.get("rq")?.trim() ?? "";
    const requestStatus = searchParams.get("requestStatus")?.trim() ?? "";

    const [users, requests] = await Promise.all([
      getUserRecords({
        ...(query ? { query } : {}),
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
      }),
      getAccessRequestRecords({
        ...(requestQuery ? { query: requestQuery } : {}),
        ...(requestStatus ? { status: requestStatus } : {}),
      }),
    ]);

    const userRows = users.map((item) => ({
      tipo: "usuario",
      nombre: item.name,
      correo: item.email,
      rol: item.role,
      estado: item.status,
      ultimo_ingreso: item.lastLogin,
    }));

    const requestRows = requests.map((item) => ({
      tipo: "solicitud_acceso",
      nombre: item.userName,
      correo: item.email,
      rol: "",
      estado: item.status,
      ultimo_ingreso: item.createdAt,
    }));

    return csvResponse(`usuarios-${dateStamp()}.csv`, toCsv([...userRows, ...requestRows]));
  }

  const rows = (await getMemberRecords(filters)).map((item) => ({
    codigo: item.code,
    nombre: item.fullName,
    correo: item.email,
    telefono: item.phone,
    dirigente: item.dirigenteName,
    provincia: item.province,
    municipio: item.municipality,
    barrio: item.neighborhood,
    zona: item.zone,
  }));
  return csvResponse(`miembros-${dateStamp()}.csv`, toCsv(rows));
}

function csvResponse(filename: string, csv: string) {
  return new Response(`\uFEFF${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function isExportKind(value: string): value is ExportKind {
  return (
    value === "coordinadores" ||
    value === "dirigentes" ||
    value === "miembros" ||
    value === "eventos" ||
    value === "usuarios"
  );
}
