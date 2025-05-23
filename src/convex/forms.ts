import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const webhookurl = "https://discord.com/api/webhooks/1375184832153256017/Psr28D8pPcq2R2Z9m0tj5s-HHQPkvxLGoNse0EJqQ2kGrlYsbrgp8lVITl-hQ7KO3Ubi"

// Create a new task with the given text
export const freeTrial = mutation({
  args: {
    fullName: v.string(),
    artistName: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    availableTimes: v.string(),
    recordingType: v.string(),
    otherRecordingType: v.optional(v.string()),
    referralSource: v.optional(v.string()),
    otherReferralSource: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const created = new Date();
    const newTaskId = await ctx.db.insert("free", {
      ...args,
      approved: null,
    });
    ctx.scheduler.runAfter(0, internal.notifyDiscord.send, {
      webhookUrl: webhookurl,
      payload: {
        embeds: [
          {
            title: args.artistName ? `${args.artistName} (${args.fullName})` : args.fullName,
            color: 0x1e8cc2,
            fields: [
              {
                name: 'Email',
                value: args.email
              },
              {
                name: 'Phone',
                value: args.phone
              },
              {
                name: 'Available Times',
                value: wrapInBlock(args.availableTimes)
              },
              {
                name: 'Recording type',
                value: args.recordingType,
              },
              ...(
                args.otherRecordingType
                  ? [{
                    name: 'Other Recording type',
                    value: wrapInBlock(args.otherRecordingType),
                  }]
                  : []
              )
            ],
            footer: {
              text: newTaskId,
            },
            timestamp: created.toISOString()
          }
        ],
        username: "Free Trail",
        avatar_url: 'https://miko-recordingstudio.ca/logo.png',
        attachments: [],
        flags: 4096
      }
    })

    return newTaskId;
  },
});

export const inquary = mutation({
  args: {
    fullName: v.string(),
    artistName: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    projectType: v.string(),
    otherProjectType: v.optional(v.string()),
    services: v.object({
      vocalRecording: v.boolean(),
      instrumentRecording: v.boolean(),
      drumKitRecording: v.boolean(),
      mixing: v.boolean(),
      mastering: v.boolean(),
      production: v.boolean(),
      other: v.boolean(),
    }),
    otherService: v.optional(v.string()),
    songCount: v.number(),
    projectGoal: v.optional(v.string()),
    completionDate: v.string(),
    budget: v.string(),
  },

  handler: async (ctx, args) => {
    const created = new Date();
    const newTaskId = await ctx.db.insert("inquarys", {
      ...args,
    });
    ctx.scheduler.runAfter(0, internal.notifyDiscord.send, {
      webhookUrl: webhookurl,
      payload: {
        embeds: [
          {
            title: args.artistName ? `${args.artistName} (${args.fullName})` : args.fullName,
            color: 0x5d204b,
            fields: [
              {
                name: 'Email',
                value: args.email
              },
              {
                name: 'Phone',
                value: args.phone
              },
              {
                name: 'Project type',
                value: args.projectType
              },
              ...(
                args.otherProjectType
                  ? [{
                    name: 'Other project type',
                    value: wrapInBlock(args.otherProjectType),
                  }]
                  : []
              ),
              {
                name: 'Required services',
                value: Object.keys(args.services).filter((f) => args.services[f as keyof typeof args.services]).map((f) => `* ${f}`).join("\n")
              },
              ...(
                args.otherService
                  ? [{
                    name: 'Other service',
                    value: wrapInBlock(args.otherService)
                  }]
                  : []
              ),
              {
                name: 'Song count',
                value: args.songCount.toString(),
              },
              {
                name: 'Completion date',
                value: args.completionDate,
              },
              {
                name: 'Budget',
                value: args.budget,
              },
            ],
            footer: {
              text: newTaskId,
            },
            timestamp: created.toISOString()
          }
        ],
        username: "Project Inquary",
        avatar_url: 'https://miko-recordingstudio.ca/logo.png',
        attachments: [],
        flags: 4096
      }
    })

    return newTaskId;
  },
});

function wrapInBlock(str: string) {
  return '```\n' + str.replace('`', '\\`') + '\n```'
}
