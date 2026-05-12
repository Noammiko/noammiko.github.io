import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ─── Queries ───────────────────────────────────────────────────── */

/** All reviews, ordered by display order */
export const listReviews = query({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    return await ctx.db
      .query("reviews")
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/** Only active reviews — used on the public site */
export const listActiveReviews = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("active"), true))
      .collect()
      .then((rows) => rows.sort((a, b) => a.order - b.order));
  },
});

/* ─── Mutations ─────────────────────────────────────────────────── */

export const createReview = mutation({
  args: {
    name:        v.string(),
    text:        v.string(),
    rating:      v.number(),
    date:        v.string(),
    image:       v.optional(v.string()),
    imagegoogle: v.optional(v.string()),
    url:         v.optional(v.string()),
    active:      v.boolean(),
    order:       v.number(),
  },
  handler: async (ctx, args) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    return await ctx.db.insert("reviews", args);
  },
});

export const updateReview = mutation({
  args: {
    id:          v.id("reviews"),
    name:        v.optional(v.string()),
    text:        v.optional(v.string()),
    rating:      v.optional(v.number()),
    date:        v.optional(v.string()),
    image:       v.optional(v.string()),
    imagegoogle: v.optional(v.string()),
    url:         v.optional(v.string()),
    active:      v.optional(v.boolean()),
    order:       v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const cleaned = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, cleaned);
  },
});

export const deleteReview = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, { id }) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    await ctx.db.delete(id);
  },
});

/**
 * Seeds the reviews table with the site's default reviews if it is empty.
 * Safe to call multiple times — no-op when reviews already exist.
 */
export const seedDefaultReviews = mutation({
  args: {},
  handler: async (ctx) => {
    if (!await ctx.auth.getUserIdentity()) throw new Error("Unauthorized");
    const existing = await ctx.db.query("reviews").collect();
    if (existing.length > 0) return { seeded: false };

    const defaults = [
      { name: "Andrei Ionescu",         text: "Love going here Miko is such a good producer best experience I ever had and amazing prices",                                                                                                                                                                               image: "",                         imagegoogle: "",                                                                                                                         url: "",                                                          rating: 5, date: "2025",    active: true, order: 0  },
      { name: "Andy Gaiger",            text: "It means a lot to transform my ideas from immaterial to audio value and Miko recording studio does it exceptionally well! It's a safe space for artists to explore their minds. I look forward to every time I go and am happy with the product every time I leave! Plus, it's much more reasonable and affordable than other studios.", image: "/reviewers/andy.png",      imagegoogle: "https://lh3.googleusercontent.com/a/ACg8ocLPH6nl8pqG0iU_E8fovHVRJQ6P_16axF2xcFN0k0kzHyuuig=w47-h47-p-rp-mo-br100", url: "https://maps.app.goo.gl/Z8TSuT2mkPKjZPVT8?g_st=iw",  rating: 5, date: "2024-09", active: true, order: 1  },
      { name: "Liza",                   text: "Yesterday, we had a great experience with Miko Recording Studio. You can tell he's a hard working & very knowledgeable person. Thank you",                                                                                                                                  image: "",                         imagegoogle: "",                                                                                                                         url: "",                                                          rating: 5, date: "2025",    active: true, order: 2  },
      { name: "grmay tesfahans",        text: "He's a nice kind of person and a professional studio man. I have already worked with them so I am so happy and he respects me a lot.",                                                                                                                                      image: "/reviewers/grmay.png",     imagegoogle: "https://lh3.googleusercontent.com/a-/ALV-UjWwiVEzFofobxgasHYjTWQlZYFenY3QfM4ptCdSjls0NAHIXeQ=w47-h47-p-rp-mo-br100", url: "https://maps.app.goo.gl/sBcpPmVCm5gUnhxX6?g_st=iw",  rating: 5, date: "2024-09", active: true, order: 3  },
      { name: "M P",                    text: "Been going to Miko for almost a year and every time super happy with the results. Definitely gonna come back.",                                                                                                                                                              image: "",                         imagegoogle: "",                                                                                                                         url: "",                                                          rating: 5, date: "2025",    active: true, order: 4  },
      { name: "Moha Flava",             text: "Very humble and the service is good mixing. You should book him if you are an upcoming artist or even big artists.",                                                                                                                                                        image: "/reviewers/moha.png",      imagegoogle: "https://lh3.googleusercontent.com/a/ACg8ocLU7L7YxUXhBuEv6yKPpKPaqedwGFpNkglWVbqFsGPrurbhAQ=w47-h47-p-rp-mo-br100", url: "https://maps.app.goo.gl/vXeGVtetL7PdQB5s8?g_st=iw",  rating: 5, date: "2023",    active: true, order: 5  },
      { name: "Mk Vlogs",               text: "BEST STUDIO OUT THERE WITH THE BEST PRICES!! IF YOU'RE AN ARTIST WHO CAN'T AFFORD TO GO TO EXPENSIVE STUDIOS AND WANT INDUSTRY STANDARD RECORDING SESSIONS THIS IS THE PLACE!!",                                                                                          image: "/reviewers/mk.png",        imagegoogle: "https://lh3.googleusercontent.com/a/ACg8ocLywIjUS9wpINVZ_zRcsBn1jY24VoNMcBzgo3pkGAQZVsU0GOE=w47-h47-p-rp-mo-br100", url: "https://maps.app.goo.gl/VwQ2ai7h8JRFbSuz6?g_st=iw",  rating: 5, date: "2023",    active: true, order: 6  },
      { name: "A Z",                    text: "Great EDM production with Noam, great creative session.",                                                                                                                                                                                                                  image: "",                         imagegoogle: "",                                                                                                                         url: "",                                                          rating: 5, date: "2025",    active: true, order: 7  },
      { name: "Balpreet Grewal Records",text: "He is doing great, hardworking and talented.",                                                                                                                                                                                                                             image: "",                         imagegoogle: "",                                                                                                                         url: "",                                                          rating: 5, date: "2025",    active: true, order: 8  },
      { name: "Mackenzie Featherstone", text: "Coming from a beginner, he's super professional and easy to work with.",                                                                                                                                                                                                   image: "/reviewers/mackenzie.png", imagegoogle: "https://lh3.googleusercontent.com/a/ACg8ocI0jOBFoRH_jd6csPU-RNdGn8xQ6RUCF_5Q3neHz9DMQt8_pg=w47-h47-p-rp-mo-br100", url: "https://maps.app.goo.gl/Yy8HyL7b8aRxL88K8?g_st=iw",  rating: 5, date: "2024",    active: true, order: 9  },
      { name: "akkvir singh",           text: "I had great experience. Best studios with great prices.",                                                                                                                                                                                                                  image: "/reviewers/akkvir.png",    imagegoogle: "https://lh3.googleusercontent.com/a-/ALV-UjWmkccDZ2rJidzro7bTin9o9caWG42GF9o0ffYjWVTSD4sRe0wl=w47-h47-p-rp-mo-br100", url: "https://maps.app.goo.gl/w8tEDKUdD2rC9F8d7?g_st=iw",  rating: 5, date: "2023",    active: true, order: 10 },
      { name: "its Jind",               text: "Nice experience.",                                                                                                                                                                                                                                                         image: "",                         imagegoogle: "",                                                                                                                         url: "",                                                          rating: 5, date: "2025",    active: true, order: 11 },
      { name: "Prayag Antony",          text: "Very professional",                                                                                                                                                                                                                                                        image: "",                         imagegoogle: "",                                                                                                                         url: "",                                                          rating: 5, date: "2025",    active: true, order: 12 },
      { name: "Avo Tokatlian",          text: "Really knowledgeable guy and knows what he is doing!",                                                                                                                                                                                                                     image: "",                         imagegoogle: "",                                                                                                                         url: "",                                                          rating: 5, date: "2025",    active: true, order: 13 },
    ];

    for (const review of defaults) {
      await ctx.db.insert("reviews", review);
    }

    return { seeded: true };
  },
});
