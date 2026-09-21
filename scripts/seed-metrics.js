const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");

  const SocialAccount = mongoose.models.SocialAccount ||
    mongoose.model(
      "SocialAccount",
      new mongoose.Schema({
        clientId: mongoose.Schema.Types.ObjectId,
        platform: String,
        username: String,
        isActive: Boolean,
      })
    );

  const MetricSnapshot =
    mongoose.models.MetricSnapshot ||
    mongoose.model(
      "MetricSnapshot",
      new mongoose.Schema({
        socialAccountId: mongoose.Schema.Types.ObjectId,
        date: Date,
        followers: Number,
        likes: Number,
        comments: Number,
        reach: Number,
        engagementRate: Number,
      })
    );

  const accounts = await SocialAccount.find({ isActive: true });
  if (accounts.length === 0) {
    console.log("No connected social accounts found. Connect one first.");
    process.exit(0);
  }

  for (const account of accounts) {
    // last 7 days metrics
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const followers = 1000 + Math.floor(Math.random() * 500) + i * 40;
      const likes = 100 + Math.floor(Math.random() * 200);
      const comments = 10 + Math.floor(Math.random() * 40);
      const reach = 1000 + Math.floor(Math.random() * 3000);
      const engagementRate = Number(((likes + comments) / Math.max(followers, 1) * 100).toFixed(2));

      await MetricSnapshot.findOneAndUpdate(
        { socialAccountId: account._id, date },
        {
          socialAccountId: account._id,
          date,
          followers,
          likes,
          comments,
          reach,
          engagementRate,
        },
        { upsert: true }
      );
    }
  }

  console.log("✅ Metrics seeded for", accounts.length, "accounts");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});