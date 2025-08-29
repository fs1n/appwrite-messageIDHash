// Appwrite Function for Message ID Hashing
import crypto from 'node:crypto';
import sdk from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    const body = JSON.parse(req.body || '{}');

    // Extract required fields from request body
    const { senderId, receiverId, listingId, content } = body;

    if (!senderId || !receiverId || !content) {
      return res.json({ error: 'missing fields' }, 400);
    }

    // Create deterministic conversation ID by sorting user IDs
    const [a, b] = [senderId, receiverId].sort();
    const key = `conv:v1:${a}|${b}:${listingId ?? 'direct'}`;
    const conversationId = crypto
      .createHash('sha256')
      .update(key)
      .digest('base64url')
      .slice(0, 48);

    log(`Creating message for conversation: ${conversationId}`);

    // Appwrite Client init
    const client = new sdk.Client()
      .setEndpoint(
        process.env.APPWRITE_FUNCTION_API_ENDPOINT ||
          process.env.APPWRITE_ENDPOINT
      )
      .setProject(
        process.env.APPWRITE_FUNCTION_PROJECT_ID ||
          process.env.APPWRITE_PROJECT_ID
      )
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    // Create persistent message with server-side generated conversationId
    const doc = await databases.createDocument(
      process.env.DB_ID,
      process.env.COL_MESSAGES_ID,
      sdk.ID.unique(),
      {
        sender: senderId,
        receiver: receiverId,
        listing: listingId ?? null,
        content,
        messageType: 'text',
        isRead: false,
        conversationId,
      }
    );

    return res.json({ ok: true, conversationId, messageId: doc.$id }, 201);
  } catch (e) {
    error('Message creation failed:', e.message);
    return res.json({ error: 'internal error' }, 500);
  }
};
