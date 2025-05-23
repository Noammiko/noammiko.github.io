import { internalAction } from "./_generated/server";
import { v } from "convex/values";

// Discord Embed Types

export const EmbedFooter = v.object({
  text: v.string(),
  icon_url: v.optional(v.string()),
  proxy_icon_url: v.optional(v.string())
});

export const EmbedImage = v.object({
  url: v.optional(v.string()),
  proxy_url: v.optional(v.string()),
  height: v.optional(v.number()),
  width: v.optional(v.number())
});

export const EmbedThumbnail = v.object({
  url: v.optional(v.string()),
  proxy_url: v.optional(v.string()),
  height: v.optional(v.number()),
  width: v.optional(v.number())
});

export const EmbedVideo = v.object({
  url: v.optional(v.string()),
  proxy_url: v.optional(v.string()),
  height: v.optional(v.number()),
  width: v.optional(v.number())
});

export const EmbedProvider = v.object({
  name: v.optional(v.string()),
  url: v.optional(v.string())
});

export const EmbedAuthor = v.object({
  name: v.string(),
  url: v.optional(v.string()),
  icon_url: v.optional(v.string()),
  proxy_icon_url: v.optional(v.string())
});

export const EmbedField = v.object({
  name: v.string(),
  value: v.string(),
  inline: v.optional(v.boolean())
});

// Attachment Object (Discord Docs: https://discord.com/developers/docs/resources/channel#attachment-object)
export const Attachment = v.object({
  id: v.string(), // Snowflake, required for referencing attachments in embeds
  filename: v.string(),
  description: v.optional(v.string()),
  content_type: v.optional(v.string()),
  size: v.optional(v.number()), // bytes
  url: v.optional(v.string()), // CDN URL
  proxy_url: v.optional(v.string()),
  height: v.optional(v.number()), // for images
  width: v.optional(v.number()), // for images
  ephemeral: v.optional(v.boolean()),
  duration_secs: v.optional(v.number()), // for audio/video files
  waveform: v.optional(v.string()) // for audio files
});

// Main Embed Schema
export const Embed = v.object({
  title: v.optional(v.string()),
  type: v.optional(v.string()),
  description: v.optional(v.string()),
  url: v.optional(v.string()),
  timestamp: v.optional(v.string()),
  color: v.optional(v.number()),
  footer: v.optional(EmbedFooter),
  image: v.optional(EmbedImage),
  thumbnail: v.optional(EmbedThumbnail),
  video: v.optional(EmbedVideo),
  provider: v.optional(EmbedProvider),
  author: v.optional(EmbedAuthor),
  fields: v.optional(v.array(EmbedField))
});

// Allowed Mentions
export const AllowedMentions = v.object({
  parse: v.optional(
    v.array(v.union(v.literal("roles"), v.literal("users"), v.literal("everyone")))
  ),
  roles: v.optional(v.array(v.string())),
  users: v.optional(v.array(v.string())),
  replied_user: v.optional(v.boolean())
});

// Full Webhook Payload schema
export const DiscordWebhookPayload = v.object({
  content: v.optional(v.string()),
  username: v.optional(v.string()),
  avatar_url: v.optional(v.string()),
  tts: v.optional(v.boolean()),
  embeds: v.optional(v.array(Embed)),
  allowed_mentions: v.optional(AllowedMentions),
  flags: v.optional(v.number()),
  attachments: v.optional(v.array(Attachment)),
  thread_name: v.optional(v.string())
});

// send function

export const send = internalAction({
  args: { webhookUrl: v.string(), payload: DiscordWebhookPayload },
  handler: async (_, args) => {
    const ret = await fetch(args.webhookUrl, {
      method: 'POST',
      body: JSON.stringify(args.payload),
      headers: { 'content-type': 'application/json' }
    });

    return ret.ok;
  },
});
