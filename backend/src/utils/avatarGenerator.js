/**
 * Generate a professional DiceBear avatar URL
 * Uses the "avataaars" style which is professional and customizable
 * @param {string} email - User email to use as seed for consistent avatars
 * @param {string} [style="avataaars"] - Avatar style
 * @returns {string} Full URL to the avatar
 */
export const generateAvatarUrl = (email, style = "avataaars") => {
  const encodedEmail = encodeURIComponent(email.toLowerCase());
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedEmail}&backgroundColor=random&scale=90`;
};

export default generateAvatarUrl;
