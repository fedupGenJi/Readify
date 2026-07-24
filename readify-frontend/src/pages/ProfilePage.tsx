import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { MOCK_SUGGESTED_READERS } from '../lib/mockFeedData';
import { FeedItemCard } from '../components/feed/FeedItemCard';
import { NewEntryModal } from '../components/feed/NewEntryModal';
import { PlusIcon } from '../components/icons';
import { Avatar } from '../components/ui/Avatar';
import type { CreateEntryPayload, FeedComment, FeedItem } from '../types/feed';
import apiClient from '../lib/api';

<<<<<<< HEAD
interface BackendUser {
  userId: number;
  name: string;
  username: string;
  profilePicture: string | null;
  bio: string | null;
}

interface ProfileResponse {
  user: BackendUser;
  isOwnProfile: boolean;
  relationship: 'self' | 'friend' | 'stranger';
  followersCount: number;
  followingCount: number;
}

interface BackendPost {
  postId: number;
  caption: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'JUST_ME';
  createdAt: string;
  likeCount: number;
  book: { bookId: number; title: string; author: string } | null;
}

interface BackendQuote {
  quoteId: number;
  quote: string;
}

function toFeedItem(post: BackendPost, profile: BackendUser): FeedItem {
  return {
    id: String(post.postId),
=======
export default function ProfilePage() {
  // TODO: Backend Integration - Replace with API call to fetch posts for the current user
  const initialUserPosts = MOCK_FEED_ITEMS.filter(
    (item) => item.author.name.toLowerCase() === CURRENT_USER.name.toLowerCase()
  );

  const defaultUserPost: FeedItem = {
    id: 'user-post-1',
>>>>>>> 9d557dd287c478a5ff2fe80075cef3d22028ff7f
    type: 'post',
    author: {
      id: String(profile.userId),
      name: profile.name,
      username: profile.username,
      avatarUrl: profile.profilePicture ?? undefined,
    },
    book: post.book
      ? { id: String(post.book.bookId), title: post.book.title, author: post.book.author, rating: 0 }
      : undefined,
    content: post.caption,
    createdAt: post.createdAt,
    visibility: post.visibility === 'JUST_ME' ? 'only_me' : (post.visibility.toLowerCase() as 'public' | 'private'),
    likeCount: post.likeCount,
    commentCount: 0,
    repostCount: 0,
    likedByMe: false,
    bookmarkedByMe: false,
    repostedByMe: false,
    comments: [],
  };
}

export default function ProfilePage() {
  const { username: viewedUsername } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [viewer, setViewer] = useState<BackendUser | null>(null);
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [profilePictureDraft, setProfilePictureDraft] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Modal state for followers/following lists
  const [activeModal, setActiveModal] = useState<'followers' | 'following' | null>(null);

<<<<<<< HEAD
  useEffect(() => {
    let isCurrentRequest = true;

    async function loadProfile() {
      setIsLoading(true);
      setLoadError('');
      try {
        const viewerResponse = await apiClient.get<{ user: BackendUser }>('/auth/me');
        const currentViewer = viewerResponse.data.user;
        const username = viewedUsername ?? currentViewer.username;
        const [profileResponse, postsResponse, quotesResponse] = await Promise.all([
          apiClient.get<ProfileResponse>(`/users/${encodeURIComponent(username)}`),
          apiClient.get<{ posts: BackendPost[] }>(`/users/${encodeURIComponent(username)}/posts`, {
            params: { limit: 30, offset: 0 },
          }),
          apiClient.get<{ quotes: BackendQuote[] }>(`/users/${encodeURIComponent(username)}/quotes`, {
            params: { limit: 20 },
          }),
        ]);

        if (!isCurrentRequest) return;
        setViewer(currentViewer);
        setProfile(profileResponse.data);
        setPosts(postsResponse.data.posts.map((post) => toFeedItem(post, profileResponse.data.user)));
        setQuotes(quotesResponse.data.quotes.map((quote) => quote.quote));
        setBioDraft(profileResponse.data.user.bio ?? '');
        setProfilePictureDraft(profileResponse.data.user.profilePicture ?? '');
      } catch {
        if (!isCurrentRequest) return;
        setLoadError('Unable to load this profile. Please try again.');
        setProfile(null);
        setPosts([]);
        setQuotes([]);
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    }

    void loadProfile();
    return () => {
      isCurrentRequest = false;
    };
  }, [viewedUsername]);

  const currentUserName = viewer?.name ?? profile?.user.name ?? '';
  const isOwnProfile = profile?.isOwnProfile ?? false;

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!isOwnProfile || isSavingProfile) return;

    setIsSavingProfile(true);
    try {
      const response = await apiClient.put<{ user: BackendUser }>('/users/me/profile', {
        bio: bioDraft,
        profilePicture: profilePictureDraft,
      });
      setProfile((current) => (current ? { ...current, user: response.data.user } : current));
      setIsEditingProfile(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Unable to update your profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

=======
>>>>>>> 9d557dd287c478a5ff2fe80075cef3d22028ff7f
  const handleDeleteItem = (id: string) => {
    if (!isOwnProfile) return;
    // TODO: Backend Integration - API call to delete post from database
    setPosts((current) => current.filter((item) => item.id !== id));
    toast.success('Post removed from profile');
  };

  const handleToggleLike = (id: string) => {
    setPosts((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              likedByMe: !item.likedByMe,
              likeCount: item.likedByMe ? item.likeCount - 1 : item.likeCount + 1,
            }
          : item
      )
    );
  };

  const handleToggleBookmark = (id: string) => {
    setPosts((current) =>
      current.map((item) => (item.id === id ? { ...item, bookmarkedByMe: !item.bookmarkedByMe } : item))
    );
  };

  const handleToggleRepost = (id: string) => {
    setPosts((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              repostedByMe: !item.repostedByMe,
              repostCount: item.repostedByMe ? item.repostCount - 1 : item.repostCount + 1,
            }
          : item
      )
    );
  };

  const handleAddComment = (itemId: string, _parentCommentId: string | null, content: string) => {
    const newComment: FeedComment = {
      id: `comment-${Date.now()}`,
      author: { id: String(viewer?.userId ?? ''), name: currentUserName, username: viewer?.username ?? '' },
      content,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setPosts((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              comments: [...item.comments, newComment],
              commentCount: item.commentCount + 1,
            }
          : item
      )
    );
  };

  const handleCreateEntry = async (payload: CreateEntryPayload) => {
<<<<<<< HEAD
    // TODO: Backend Integration - API call to create a new post/review entry in DB
    // const response = await api.post('/api/posts', payload);
    if (!viewer || !isOwnProfile) return;
    const author = { id: String(viewer.userId), name: viewer.name, username: viewer.username };
=======
    const author = { id: CURRENT_USER.id, name: CURRENT_USER.name, username: CURRENT_USER.name.toLowerCase() };
>>>>>>> 9d557dd287c478a5ff2fe80075cef3d22028ff7f
    const book = {
      id: `book-${Date.now()}`,
      title: payload.bookTitle,
      author: payload.bookAuthor,
      rating: payload.rating,
    };
    const base = {
      id: `${payload.isReview ? 'review' : 'post'}-${Date.now()}`,
      author,
      book,
      content: payload.content,
      createdAt: new Date().toISOString(),
      visibility: payload.visibility,
      likeCount: 0,
      commentCount: 0,
      repostCount: 0,
      likedByMe: false,
      bookmarkedByMe: false,
      repostedByMe: false,
      comments: [] as FeedComment[],
    };

    const newItem: FeedItem = payload.isReview ? { ...base, type: 'review' } : { ...base, type: 'post' };

    setPosts((current) => [newItem, ...current]);
    toast.success(payload.isReview ? 'Review published!' : 'Posted!');
  };

  const handleAddQuote = (e: FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;
    // TODO: Backend Integration - API call to persist quote in DB
    setQuotes([...quotes, newQuoteText.trim()]);
    setNewQuoteText('');
    toast.success('Quote added!');
  };

  const handleDeleteQuote = (indexToRemove: number) => {
    setQuotes(quotes.filter((_, index) => index !== indexToRemove));
    toast.success('Quote removed');
  };

  const handleToggleFollowUser = (_targetUserId: string) => {
    // TODO: Backend Integration - Handler for follow/unfollow
  };

  return (
<<<<<<< HEAD
    <div className="w-full space-y-8 pb-12">
      {isLoading && <p className="text-sm text-textSecondary">Loading profile...</p>}
      {!isLoading && loadError && <p className="text-sm text-error">{loadError}</p>}
      {!isLoading && !profile && !loadError && <p className="text-sm text-textSecondary">Profile not found.</p>}

      {!isLoading && profile && (
        <>
      {/* Profile Header */}
      <div className="flex items-start gap-6">
        <Avatar name={profile.user.name} src={profile.user.profilePicture ?? undefined} size="lg" className="h-24 w-24 border-2 border-white text-2xl shadow-md" />
=======
    <div className="w-full space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-start gap-6 bg-card rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-primary/10 border-2 border-white shadow-md">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
            alt={CURRENT_USER.name}
            className="h-full w-full object-cover"
          />
        </div>
>>>>>>> 9d557dd287c478a5ff2fe80075cef3d22028ff7f
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text">{profile.user.name}</h1>
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setIsEditingProfile((current) => !current)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-textSecondary hover:bg-gray-50"
              >
                {isEditingProfile ? 'Cancel' : 'Edit profile'}
              </button>
            )}
          </div>
          <p className="text-sm text-textSecondary">@{profile.user.username}</p>
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="max-w-lg space-y-2 pt-2">
              <textarea
                value={bioDraft}
                onChange={(event) => setBioDraft(event.target.value)}
                maxLength={500}
                placeholder="Tell readers about yourself..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
              />
              <input
                type="url"
                value={profilePictureDraft}
                onChange={(event) => setProfilePictureDraft(event.target.value)}
                placeholder="Profile picture URL"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={isSavingProfile}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProfile ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          ) : (
            <p className="pt-1 text-sm text-text leading-relaxed max-w-lg">{profile.user.bio ?? ''}</p>
          )}
          {!profile.isOwnProfile && (
            <p className="pt-1 text-xs font-medium capitalize text-primary">{profile.relationship}</p>
          )}
          <div className="flex gap-8 pt-3 text-sm">
            <button
              type="button"
              onClick={() => setActiveModal('followers')}
              className="hover:opacity-80 transition-opacity text-left"
            >
              <span className="font-bold text-text">{profile.followersCount}</span>{' '}
              <span className="text-textSecondary">Followers</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('following')}
              className="hover:opacity-80 transition-opacity text-left"
            >
              <span className="font-bold text-text">{profile.followingCount}</span>{' '}
              <span className="text-textSecondary">Following</span>
            </button>
            <div>
              <span className="font-bold text-text">{posts.length}</span>{' '}
              <span className="text-textSecondary">Posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Posts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
<<<<<<< HEAD
            <h2 className="text-lg font-bold text-text pb-2 border-b-2 border-primary">Posts</h2>
            {isOwnProfile && <button
=======
            <h2 className="text-lg font-bold text-text pb-2">Posts</h2>
            <button
>>>>>>> 9d557dd287c478a5ff2fe80075cef3d22028ff7f
              type="button"
              onClick={() => setIsEntryModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-primary/90"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              New Post
            </button>}
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {posts.map((item) => (
                <FeedItemCard
                  key={item.id}
                  item={item}
                  currentUserName={currentUserName}
                  onToggleLike={handleToggleLike}
                  onToggleBookmark={handleToggleBookmark}
                  onToggleRepost={handleToggleRepost}
                  onAddComment={handleAddComment}
                  onDelete={handleDeleteItem}
                />
              ))}
            </AnimatePresence>

            {posts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-card p-10 text-center">
                <p className="text-sm font-medium text-text">No posts published yet.</p>
                {isOwnProfile && <p className="mt-1 text-sm text-textSecondary">Click "New Post" to share what you're reading.</p>}
              </div>
            )}
          </div>
        </div>

<<<<<<< HEAD
        {/* Right: Quotes Section */}
        {(quotes.length > 0 || isOwnProfile) && <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-100 bg-card p-6 shadow-sm space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-text flex items-center gap-2">
=======
        {/* Right: Optimized Quotes Section */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-100 bg-card p-6 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-text flex items-center gap-2 text-sm">
>>>>>>> 9d557dd287c478a5ff2fe80075cef3d22028ff7f
                <span>🎉</span> Quotes
              </h3>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {quotes.length} saved
              </span>
            </div>

            <ul className="space-y-3 text-sm text-text max-h-[320px] overflow-y-auto pr-1">
              {quotes.map((quote, index) => (
                <li
                  key={index}
                  className="group relative flex items-start justify-between gap-3 text-xs leading-relaxed border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="italic text-textSecondary font-medium">"{quote}"</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuote(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-textSecondary hover:text-red-500 shrink-0"
                    title="Remove quote"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddQuote} className="pt-3 border-t border-gray-100 space-y-2">
              <textarea
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                placeholder="Add a memorable quote..."
                rows={2}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
              >
                Add Quote
              </button>
            </form>
          </div>
        </div>}
      </div>

      {/* Followers / Following Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-card border border-gray-100 shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="font-bold text-text capitalize">
                  {activeModal} ({activeModal === 'followers' ? '3' : '3'})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-textSecondary hover:text-text font-bold text-lg"
                >
                  &times;
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                {MOCK_SUGGESTED_READERS.map((reader) => (
                  <div key={reader.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {reader.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text">{reader.name}</p>
                        <p className="text-xs text-textSecondary">@{reader.username}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleFollowUser(reader.id)}
                      className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                    >
                      {activeModal === 'following' ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEntryModalOpen && (
          <NewEntryModal key="entry-modal" onClose={() => setIsEntryModalOpen(false)} onSubmit={handleCreateEntry} />
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}