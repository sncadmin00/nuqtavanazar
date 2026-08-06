import { SignJWT } from "jose";

export function livekitConfigured() {
  return Boolean(process.env["LIVEKIT_API_KEY"] && process.env["LIVEKIT_API_SECRET"] && process.env["LIVEKIT_URL"]);
}

export function livekitUrl() {
  return process.env["LIVEKIT_URL"] ?? "";
}

/**
 * Токен участника аудио-комнаты. Публикация звука разрешена всегда на уровне
 * комнаты, но клиент включает микрофон только на своём ходу.
 */
export async function createRoomToken(room: string, identity: string, name: string) {
  const apiKey = process.env["LIVEKIT_API_KEY"];
  const apiSecret = process.env["LIVEKIT_API_SECRET"];
  if (!apiKey || !apiSecret) throw new Error("LiveKit не настроен");

  const now = Math.floor(Date.now() / 1000);
  const secret = new TextEncoder().encode(apiSecret);

  return new SignJWT({
    name,
    video: {
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    },
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(apiKey)
    .setSubject(identity)
    .setJti(`${identity}-${now}`)
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60)
    .sign(secret);
}
