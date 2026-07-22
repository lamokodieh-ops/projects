"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LikeButton({
  postId,
  initialLiked,
  count,
}: {
  postId: string;
  initialLiked: boolean;
  count: number;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(count);

  async function toggle() {
    const res = await fetch(`/api/social/${postId}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={toggle} className="hover:text-navy transition-colors">
      {liked ? "Liked" : "Like"} · {likeCount}
    </button>
  );
}
