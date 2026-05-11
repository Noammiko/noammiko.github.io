import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

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
      webhookUrl: process.env.DISCORD_WEBHOOK ?? "",
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
      }
    });
    ctx.scheduler.runAfter(0, internal.notifyEmail.send, {
      to: "noamiko.shalit@gmail.com",
      subject: `🎙 New Free Trial Request — ${args.artistName ?? args.fullName}`,
      html: freeTrialEmailHtml(args),
    });
    ctx.scheduler.runAfter(0, internal.notifyEmail.send, {
      to: args.email,
      subject: "We received your free session request — Miko Recording Studio",
      html: freeTrialConfirmationHtml(args.fullName),
    });

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
      webhookUrl: process.env.DISCORD_WEBHOOK ?? "",
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
      }
    });
    ctx.scheduler.runAfter(0, internal.notifyEmail.send, {
      to: "noamiko.shalit@gmail.com",
      subject: `📋 New Project Inquiry — ${args.artistName ?? args.fullName}`,
      html: inquiryEmailHtml(args),
    });
    ctx.scheduler.runAfter(0, internal.notifyEmail.send, {
      to: args.email,
      subject: "We received your project inquiry — Miko Recording Studio",
      html: inquiryConfirmationHtml(args.fullName),
    });

    return newTaskId;
  },
});

function wrapInBlock(str: string) {
  return '```\n' + str.replace('`', '\\`') + '\n```'
}

type FreeTrialArgs = {
  fullName: string;
  artistName?: string;
  email: string;
  phone: string;
  availableTimes: string;
  recordingType: string;
  otherRecordingType?: string;
  referralSource?: string;
  otherReferralSource?: string;
};

type InquiryArgs = {
  fullName: string;
  artistName?: string;
  email: string;
  phone: string;
  projectType: string;
  otherProjectType?: string;
  services: Record<string, boolean>;
  otherService?: string;
  songCount: number;
  projectGoal?: string;
  completionDate: string;
  budget: string;
};

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 12px;font-weight:600;color:#555;white-space:nowrap">${label}</td><td style="padding:6px 12px">${value}</td></tr>`;
}

function emailWrapper(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#222;max-width:600px;margin:0 auto;padding:24px">
<h2 style="margin-bottom:4px">${title}</h2>
<table style="border-collapse:collapse;width:100%;margin-top:16px;background:#f9f9f9;border-radius:8px">${body}</table>
</body></html>`;
}

function freeTrialEmailHtml(args: FreeTrialArgs) {
  const name = args.artistName ? `${args.artistName} (${args.fullName})` : args.fullName;
  const rows = [
    row("Name", name),
    row("Email", args.email),
    row("Phone", args.phone),
    row("Recording type", args.otherRecordingType ? `${args.recordingType} — ${args.otherRecordingType}` : args.recordingType),
    row("Available times", args.availableTimes.replace(/\n/g, "<br>")),
    ...(args.referralSource ? [row("Referred by", args.otherReferralSource ?? args.referralSource)] : []),
  ].join("");
  return emailWrapper("🎙 New Free Trial Request", rows);
}

function inquiryEmailHtml(args: InquiryArgs) {
  const name = args.artistName ? `${args.artistName} (${args.fullName})` : args.fullName;
  const services = Object.entries(args.services).filter(([, v]) => v).map(([k]) => k).join(", ");
  const rows = [
    row("Name", name),
    row("Email", args.email),
    row("Phone", args.phone),
    row("Project type", args.otherProjectType ? `${args.projectType} — ${args.otherProjectType}` : args.projectType),
    row("Services", args.otherService ? `${services}, ${args.otherService}` : services),
    row("Song count", String(args.songCount)),
    row("Budget", args.budget),
    row("Completion date", args.completionDate),
    ...(args.projectGoal ? [row("Goal", args.projectGoal.replace(/\n/g, "<br>"))] : []),
  ].join("");
  return emailWrapper("📋 New Project Inquiry", rows);
}

function freeTrialConfirmationHtml(fullName: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#222;max-width:600px;margin:0 auto;padding:24px">
<h2>Hey ${fullName}!</h2>
<p>We received your free session request and we'll be in touch shortly to confirm your booking.</p>
<p>Talk soon,<br><strong>Miko Recording Studio</strong></p>
</body></html>`;
}

function inquiryConfirmationHtml(fullName: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#222;max-width:600px;margin:0 auto;padding:24px">
<h2>Hey ${fullName}!</h2>
<p>We received your project inquiry and will review it and get back to you soon.</p>
<p>Talk soon,<br><strong>Miko Recording Studio</strong></p>
</body></html>`;
}
