// index.mjs (Appwrite Function, Runtime: Node 18+)
import crypto from "node:crypto";
import sdk from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const body = JSON.parse(req.body || "{}");

    // Authentifizierten Nutzer aus Headern/Token ziehen, je nach Setup
    // oder als Parameter validieren. Beispiel:
    const { senderId, receiverId, listingId, content } = body;

    if (!senderId || !receiverId || !content) {
      return res.json({ error: "missing fields" }, 400);
    }

    const [a, b] = [senderId, receiverId].sort();
    const key = `conv:v1:${a}|${b}:${listingId ?? "direct"}`;
    const conversationId = crypto.createHash("sha256")
      .update(key)
      .digest("base64url")
      .slice(0, 48);

    // Appwrite Client init
    const client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    // Persistente Nachricht anlegen (conversationId serverseitig gesetzt)
    const doc = await databases.createDocument(
      process.env.DB_ID,
      process.env.COL_MESSAGES_ID,
      sdk.ID.unique(),
      {
        sender: senderId,
        receiver: receiverId,
        listing: listingId ?? null,
        content,
        messageType: "text",
        isRead: false,
        conversationId
      }
    );

    return res.json({ ok: true, conversationId, messageId: doc.$id }, 201);
  } catch (e) {
    error(e);
    return res.json({ error: "internal error" }, 500);
  }
};
