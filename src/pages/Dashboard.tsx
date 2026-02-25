import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { createPost, getHomeFeed } from "../services/postService";
import type { Post, PostType, PostVisibility } from "../types";
import { Pin, Send, Shield, Heart, MessageCircle, Share2 } from "lucide-react";

const typeLabel: Record<PostType, string> = {
  post: "Post",
  event_request: "Event request",
  other_request: "Request",
};

const visibilityLabel: Record<PostVisibility, string> = {
  public: "Public",
  admin: "Admin only",
};

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 20)); // Mock likes

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <Card
      className={`relative ${post.isPinned ? "border-[#f8d32d]/60 shadow-lg" : "hover:shadow-md transition-shadow"}`}
    >
      {post.isPinned && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#f8d32d] rounded-full flex items-center justify-center shadow-md">
          <Pin className="w-3 h-3 text-[#19316d]" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3972a1] to-[#19316d] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {post.authorName?.[0] || "U"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {post.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-[#f8d32d]/20 text-[#19316d] border border-[#f8d32d]/40">
                <Pin className="w-3 h-3" />
                Pinned Post
              </span>
            )}
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#3972a1]/10 text-[#3972a1] border border-[#3972a1]/20">
              {typeLabel[post.type]}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {visibilityLabel[post.visibility]}
            </span>
          </div>

          <p className="font-semibold text-[#19316d] dark:text-white">
            {post.authorName || "Unknown User"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date(post.createdAt).toLocaleString()}
          </p>

          <p className="mt-3 text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {/* Engagement Stats */}
          {(likeCount > 0 || Math.floor(Math.random() * 10) > 0) && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              {likeCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Heart className="w-4 h-4 text-[#b42940] fill-current" />
                  <span>{likeCount}</span>
                </div>
              )}
              {Math.floor(Math.random() * 10) > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <MessageCircle className="w-4 h-4" />
                  <span>{Math.floor(Math.random() * 10)} comments</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                liked
                  ? "text-[#b42940] bg-[#b42940]/10"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              Like
            </button>

            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MessageCircle className="w-4 h-4" />
              Comment
            </button>

            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [type, setType] = useState<PostType>("post");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const feedTitle = useMemo(() => {
    return user?.role === "admin" ? "Home Feed (Admin)" : "Home Feed";
  }, [user?.role]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await getHomeFeed();
      setPosts(data);
    } catch (e) {
      console.error("Failed to load feed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleSubmit = async () => {
    if (!user) return;
    if (!content.trim()) {
      setNotice("Write something first.");
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      await createPost({
        authorId: user.id,
        content: content.trim(),
        visibility,
        type,
      });

      setNotice("Posted. Admins were notified to review and award points.");

      setContent("");
      setVisibility("public");
      setType("post");
    } catch (e) {
      console.error("Failed to create post:", e);
      setNotice("Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Hero / Community Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#19316d] via-[#3972a1] via-[#f8d32d] via-[#198a40] to-[#b42940] shadow-xl overflow-hidden relative">
        <div className="relative px-6 py-6 lg:px-8 lg:py-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/80 font-semibold">
                Welcome to the Community
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold mt-1 font-sans tracking-tight text-white">
                {feedTitle}
              </h1>
              <p className="mt-3 text-sm lg:text-base text-white/90 max-w-xl">
                Connect with fellow students, share your journey, and grow
                together in our PHP community. Every post, task, and interaction
                brings you closer to success!
              </p>
            </div>
            {user && (
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f8d32d] to-[#198a40] text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex gap-3 text-xs">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f8d32d]"></span>
                      <span className="font-medium text-[#f8d32d]">
                        {user.points ?? 0} pts
                      </span>
                    </span>
                    <span className="text-white/80">
                      Rank #{user.rank ?? 0}
                    </span>
                    <span className="text-[#b42940] capitalize font-medium">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3-column layout: left profile, center feed, right side info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left column: profile / quick links */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-[#f7f8fa] shadow-lg">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#3972a1]">
                Your snapshot
              </p>
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f8d32d] text-[#19316d] flex items-center justify-center font-semibold">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs mt-1">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Points</p>
                      <p className="font-semibold text-[#198a40]">
                        {user.points ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Rank</p>
                      <p className="font-semibold text-[#19316d] dark:text-white">
                        #{user.rank ?? 0}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sign in to see your community stats.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-semibold text-[#b42940] mb-3">
              Shortcuts
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Button
                variant="ghost"
                onClick={() => navigate("/tasks")}
                className="justify-start"
              >
                Browse tasks
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/events")}
                className="justify-start"
              >
                Upcoming events
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/php-members")}
                className="justify-start"
              >
                PHP members
              </Button>
              {user?.role === "admin" && (
                <Button
                  variant="ghost"
                  onClick={() => navigate("/admin")}
                  className="justify-start"
                >
                  Admin dashboard
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Center: composer + feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Post Composer */}
          <Card className="bg-[#f0f2f5] border-2 border-dashed border-[#3972a1]/20 hover:border-[#3972a1]/40 shadow-lg transition-colors">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f8d32d] to-[#198a40] flex items-center justify-center text-white font-bold text-lg">
                  {user?.firstName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#19316d] dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Share something with the community...
                  </p>
                </div>
                {user?.role === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin?tab=posts")}
                    className="border-[#3972a1] text-[#3972a1] hover:bg-[#3972a1] hover:text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Review posts
                  </Button>
                )}
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="What's on your mind? Share your thoughts, ask questions, or request help..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#3972a1] focus:border-transparent bg-gray-50 text-gray-900 dark:text-white font-sans resize-none"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select
                    value={visibility}
                    onChange={(e) =>
                      setVisibility(e.target.value as PostVisibility)
                    }
                    className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3972a1] focus:border-transparent bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium"
                    aria-label="Post visibility"
                  >
                    <option value="public">🌍 Public</option>
                    <option value="admin">🔒 Admin only</option>
                  </select>

                  {user?.role === "admin" && (
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as PostType)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3972a1] focus:border-transparent bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium"
                      aria-label="Post type"
                    >
                      <option value="post">💬 General post</option>
                      <option value="event_request">🎉 Event request</option>
                      <option value="other_request">❓ Other request</option>
                    </select>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setContent("");
                      setNotice(null);
                    }}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !content.trim()}
                    className="bg-gradient-to-r from-[#19316d] to-[#3972a1] hover:from-[#19316d]/90 hover:to-[#3972a1]/90 text-white border-0"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? "Posting..." : "Share"}
                  </Button>
                </div>
              </div>

              {notice && (
                <div
                  className={`text-sm rounded-xl px-4 py-3 border ${
                    notice.includes("Failed")
                      ? "text-[#b42940] bg-[#b42940]/10 border-[#b42940]/20"
                      : "text-[#198a40] bg-[#198a40]/10 border-[#198a40]/20"
                  }`}
                >
                  {notice}
                </div>
              )}
            </div>
          </Card>

          {loading ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 font-sans">
              Loading feed...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 font-sans">
              No public posts yet.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>

        {/* Right column: community features */}
        <div className="lg:col-span-1 space-y-4">
          {/* Community Stats */}
          <Card className="bg-[#f7f8fa] shadow-lg">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">Community Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-[#f8d32d]">
                    {posts.length}
                  </p>
                  <p className="text-sm opacity-90">Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#198a40]">
                    {user?.points || 0}
                  </p>
                  <p className="text-sm opacity-90">Your Points</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-[#198a40] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f8d32d]"></span>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => navigate("/tasks")}
                className="w-full justify-start border-[#3972a1] text-[#3972a1] hover:bg-[#3972a1] hover:text-white"
              >
                📋 Browse Tasks
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/events")}
                className="w-full justify-start border-[#198a40] text-[#198a40] hover:bg-[#198a40] hover:text-white"
              >
                🎉 View Events
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/leaderboard")}
                className="w-full justify-start border-[#f8d32d] text-[#19316d] hover:bg-[#f8d32d]"
              >
                🏆 Leaderboard
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/php-members")}
                className="w-full justify-start border-[#b42940] text-[#b42940] hover:bg-[#b42940] hover:text-white"
              >
                👥 PHP Members
              </Button>
            </div>
          </Card>

          {/* Community Guidelines */}
          <Card>
            <h3 className="font-semibold text-[#f8d32d] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#198a40]"></span>
              Community Guidelines
            </h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#198a40] mt-1">✓</span>
                <span>Be respectful and supportive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#198a40] mt-1">✓</span>
                <span>Share knowledge and help others</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f8d32d] mt-1">💡</span>
                <span>Post requests get admin attention</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#b42940] mt-1">⚠</span>
                <span>Keep content appropriate</span>
              </li>
            </ul>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="font-semibold text-[#19316d] dark:text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3972a1]"></span>
              Recent Activity
            </h3>
            <div className="space-y-3">
              {posts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#3972a1] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {post.authorName?.[0] || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      <span className="font-medium text-[#19316d] dark:text-white">
                        {post.authorName}
                      </span>{" "}
                      {post.type === "post"
                        ? "shared a post"
                        : post.type === "event_request"
                          ? "requested an event"
                          : "made a request"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
