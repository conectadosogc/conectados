import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

type R2Config = {
  bucketName: string;
  endpoint: string;
  publicBaseUrl: string;
};

function isR2AccessDenied(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AccessDenied"
  );
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function getAvatarExtension(file: File) {
  const byMime: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };

  if (byMime[file.type]) {
    return byMime[file.type];
  }

  const extension = path.extname(file.name).toLowerCase();
  return extension || ".jpg";
}

function getR2Config(): null | R2Config {
  const bucketUrl = process.env.R2_BUCKET_URL?.trim();
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();

  if (!bucketUrl || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const parsed = new URL(bucketUrl);
  const bucketName = parsed.pathname.replace(/^\/+/, "").split("/")[0];
  assert(bucketName, "R2_BUCKET_URL debe incluir el nombre del bucket.");

  return {
    bucketName,
    endpoint: `${parsed.protocol}//${parsed.host}`,
    publicBaseUrl: (
      publicBaseUrl || `${parsed.protocol}//${parsed.host}/${bucketName}`
    ).replace(/\/+$/, ""),
  };
}

function getR2Client() {
  const config = getR2Config();
  if (!config) return null;

  return {
    client: new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
      },
    }),
    config,
  };
}

function isLocalAvatarPath(value: string | null | undefined) {
  return Boolean(value && value.startsWith("/uploads/avatars/"));
}

function getR2ObjectKey(avatarUrl: string, publicBaseUrl: string) {
  if (!avatarUrl.startsWith(publicBaseUrl)) {
    return null;
  }

  const suffix = avatarUrl.slice(publicBaseUrl.length).replace(/^\/+/, "");
  return suffix || null;
}

export async function persistAvatar(file: File, userId: string) {
  assert(file.size > 0, "La foto no contiene datos.");
  assert(file.size <= MAX_AVATAR_SIZE, "La foto debe pesar 2 MB o menos.");
  assert(ALLOWED_TYPES.includes(file.type), "La foto debe estar en JPG, PNG, WEBP o GIF.");

  const extension = getAvatarExtension(file);
  const filename = `${userId}-${randomUUID()}${extension}`;
  const objectKey = `avatars/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const r2 = getR2Client();

  if (r2) {
    try {
      await r2.client.send(
        new PutObjectCommand({
          Bucket: r2.config.bucketName,
          Key: objectKey,
          Body: buffer,
          ContentType: file.type || "application/octet-stream",
        }),
      );
    } catch (error) {
      if (isR2AccessDenied(error)) {
        throw new Error(
          "Cloudflare R2 rechazo la subida del avatar. Revisa que la clave tenga permiso de escritura sobre el bucket configurado.",
        );
      }

      throw new Error("No se pudo guardar la foto de perfil en el almacenamiento configurado.");
    }

    return `${r2.config.publicBaseUrl}/${objectKey}`;
  }

  const directory = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(directory, { recursive: true });
  const target = path.join(directory, filename);
  await writeFile(target, buffer);

  return `/uploads/avatars/${filename}`;
}

export async function deleteAvatar(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return;

  if (isLocalAvatarPath(avatarUrl)) {
    const target = path.join(process.cwd(), "public", avatarUrl);
    try {
      await unlink(target);
    } catch {}
    return;
  }

  const r2 = getR2Client();
  if (!r2) return;

  const objectKey = getR2ObjectKey(avatarUrl, r2.config.publicBaseUrl);
  if (!objectKey) return;

  try {
    await r2.client.send(
      new DeleteObjectCommand({
        Bucket: r2.config.bucketName,
        Key: objectKey,
      }),
    );
  } catch {}
}
