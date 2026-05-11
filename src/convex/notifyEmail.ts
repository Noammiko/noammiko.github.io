import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const send = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (_, args) => {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Miko Recording Studio <notifications@miko-recordingstudio.ca>",
        to: args.to,
        subject: args.subject,
        html: args.html,
      }),
    });
    return res.ok;
  },
});
