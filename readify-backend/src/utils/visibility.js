// Maps a viewer's relationship to a profile owner into which visibility
// tiers they're allowed to see. Used identically by posts, quotes, and
// reviews so the rule only has to be defined once.
const VISIBILITY_TIERS = {
  self: ['PUBLIC', 'PRIVATE', 'JUST_ME'],
  friend: ['PUBLIC', 'PRIVATE'],
  stranger: ['PUBLIC'],
};

function getVisibleTiers(relationship) {
  return VISIBILITY_TIERS[relationship] || VISIBILITY_TIERS.stranger;
}

module.exports = { getVisibleTiers };