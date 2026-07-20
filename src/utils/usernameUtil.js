// Keep this in one place so signup, google-complete-signup, and the
// check-username endpoint all agree on what a "valid" username looks like.
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

function isValidUsernameFormat(username) {
  return typeof username === 'string' && USERNAME_REGEX.test(username);
}

module.exports = { isValidUsernameFormat, USERNAME_REGEX };