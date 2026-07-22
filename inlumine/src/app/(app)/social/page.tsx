import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, PageLede, EmptyState } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeDate } from "@/lib/utils";
import { SocialComposer } from "@/components/social-composer";
import { LikeButton } from "@/components/like-button";

export default async function SocialPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const posts = await prisma.socialPost.findMany({
    include: {
      author: { select: { id: true, fullName: true, profilePhoto: true } },
      comments: {
        include: { author: { select: { fullName: true } } },
        orderBy: { createdAt: "asc" },
        take: 5,
      },
      likes: { select: { userId: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="max-w-xl">
      <PageTitle>Feed</PageTitle>
      <PageLede>Updates from the PRESEC alumni community.</PageLede>

      <SocialComposer />

      {posts.length === 0 ? (
        <EmptyState title="Quiet for now" description="Share something with fellow alumni." />
      ) : (
        <ul className="divide-y divide-navy/[0.08]">
          {posts.map((post) => {
            const liked = post.likes.some((l) => l.userId === session.user.id);
            return (
              <li key={post.id} className="py-8">
                <div className="flex gap-4 mb-4">
                  <Avatar name={post.author.fullName} photo={post.author.profilePhoto} size="sm" />
                  <div>
                    <p className="text-sm text-navy">{post.author.fullName}</p>
                    <p className="text-[0.65rem] text-muted tabular-nums">{formatRelativeDate(post.createdAt)}</p>
                  </div>
                </div>
                <p className="text-[0.9rem] text-navy/85 leading-relaxed whitespace-pre-wrap mb-5">{post.content}</p>
                <div className="flex items-center gap-5 text-[0.68rem] tracking-wide uppercase text-muted">
                  <LikeButton postId={post.id} initialLiked={liked} count={post._count.likes} />
                  <span>{post._count.comments} comments</span>
                </div>
                {post.comments.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-navy/[0.06] space-y-3">
                    {post.comments.map((c) => (
                      <p key={c.id} className="text-sm text-muted">
                        <span className="text-navy">{c.author.fullName}</span> — {c.content}
                      </p>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
