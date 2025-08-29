# ⚡ Appwrite Message ID Hash Function

An Appwrite function that creates deterministic conversation IDs and stores messages with proper conversation grouping. Perfect for building messaging systems where you need consistent conversation identifiers based on participants. 🚀

## 🧰 Usage

This function creates messages and manages conversations by generating deterministic conversation IDs based on the participants involved.

### POST /

Creates a new message and returns the conversation ID and message ID.

**Request Body**

```json
{
  "senderId": "user123",
  "receiverId": "user456",
  "listingId": "listing789",
  "content": "Hello, is this item still available?"
}
```

**Required Fields:**

- `senderId` (string): ID of the message sender
- `receiverId` (string): ID of the message receiver
- `content` (string): Message content

**Optional Fields:**

- `listingId` (string): ID of the listing/item being discussed (defaults to "direct" for direct messages)

**Response**

Sample `201` Response:

```json
{
  "ok": true,
  "conversationId": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvw",
  "messageId": "507f1f77bcf86cd799439011"
}
```

Sample `400` Error Response:

```json
{
  "error": "missing fields"
}
```

Sample `500` Error Response:

```json
{
  "error": "internal error"
}
```

## 🔍 How It Works

The function generates deterministic conversation IDs by:

1. **Sorting participant IDs**: Orders `senderId` and `receiverId` alphabetically to ensure consistent conversation IDs regardless of who sends the first message
2. **Creating a unique key**: Combines sorted user IDs and optional listing ID into a versioned key format: `conv:v1:userA|userB:listingId`
3. **Hashing**: Uses SHA-256 to hash the key and converts to base64url, taking first 48 characters for the conversation ID
4. **Storing**: Saves the message to Appwrite database with the generated conversation ID

This approach ensures that:

- The same two users always get the same conversation ID
- Messages are properly grouped by conversation
- Listing-specific conversations are separated from direct messages
- The system is scalable and deterministic

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (18.0)   |
| Entrypoint        | `hash.js`     |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

The following environment variables are required for this function to work:

| Variable                                                | Description                                      | Example                        |
| ------------------------------------------------------- | ------------------------------------------------ | ------------------------------ |
| `APPWRITE_FUNCTION_API_ENDPOINT` or `APPWRITE_ENDPOINT` | Appwrite API endpoint URL                        | `https://cloud.appwrite.io/v1` |
| `APPWRITE_FUNCTION_PROJECT_ID` or `APPWRITE_PROJECT_ID` | Appwrite project ID                              | `60d0fd2b5e8a9`                |
| `APPWRITE_API_KEY`                                      | Appwrite API key with database write permissions | `d1efb...f78a9`                |
| `DB_ID`                                                 | Database ID where messages are stored            | `main`                         |
| `COL_MESSAGES_ID`                                       | Collection ID for the messages collection        | `messages`                     |

## 📊 Database Schema

The function expects a messages collection with the following attributes:

| Attribute        | Type    | Description                          |
| ---------------- | ------- | ------------------------------------ |
| `sender`         | String  | ID of the message sender             |
| `receiver`       | String  | ID of the message receiver           |
| `listing`        | String  | ID of the related listing (optional) |
| `content`        | String  | Message content                      |
| `messageType`    | String  | Type of message (defaults to "text") |
| `isRead`         | Boolean | Whether message has been read        |
| `conversationId` | String  | Generated conversation identifier    |

## 🚀 Deployment

1. Create an Appwrite function with Node.js 18+ runtime
2. Set the entrypoint to `hash.js`
3. Configure the required environment variables
4. Set up your database and messages collection with the required schema
5. Deploy the function

The function will be available at your Appwrite function endpoint and ready to handle message creation requests.
