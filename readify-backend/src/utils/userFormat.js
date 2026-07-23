// Shared by authController and profileController so every endpoint that
// returns a user shapes/sanitizes it the exact same way.

function stripHtml(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '').trim();
}

function toPublicUser(user) {
  return {
    userId: user.user_id,
    name: stripHtml(user.name),
    username: user.username,
    gmail: user.gmail,
    profilePicture: user.profile_picture || null,
    bio: user.bio ? stripHtml(user.bio) : null,
    isFirstLogin: user.is_first_login,
  };
}

module.exports = { toPublicUser, stripHtml };