"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Post = {
  id: string;
  content: string;
  mediaUrl?: string | null;
  createdAt: string;
  author: { id: string; name: string | null; username: string; image?: string | null };
  likes: Array<{ id: string; userId: string }>;
  comments: Array<{ id: string; content: string }>;
};

export default function Home() {
  const { status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/posts").then((r) => r.json()).then(setPosts).catch(() => setPosts([]));
  }, []);

  const submitPost = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts", { method: "POST", body: JSON.stringify({ content }) });
      if (res.ok) {
        const created = await res.json();
        setPosts((p) => [created, ...p]);
        setContent("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Home</h1>
      {status === "authenticated" ? (
        <div className="border rounded p-4 space-y-3">
          <textarea className="w-full border rounded p-2" rows={3} placeholder="What's happening?" value={content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={submitPost} disabled={loading || content.trim().length === 0} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      ) : (
        <p className="text-sm">Please log in to post.</p>
      )}
      <div className="space-y-4">
        {posts.map((p) => (
          <div key={p.id} className="border rounded p-4">
            <div className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
            <div className="whitespace-pre-wrap">{p.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
