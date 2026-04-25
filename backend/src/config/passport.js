import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { generateAvatarUrl } from "../utils/avatarGenerator.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();

        let [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) {
          const avatarUrl = profile.photos?.[0]?.value || generateAvatarUrl(email);

          [user] = await db
            .insert(users)
            .values({
              email,
              firstName: profile.name.givenName || profile.displayName,
              lastName: profile.name.familyName || "",
              oauthProvider: "google",
              oauthId: profile.id,
              avatarUrl,
              role: "hr",
            })
            .returning();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id }));

export default passport;
