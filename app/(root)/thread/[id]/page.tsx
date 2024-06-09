import React from "react";
import ThreadCard from "@/components/cards/ThreadCard";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import Comment from "@/components/forms/Comment";

async function ThreadDetailPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const user = await currentUser();

  if (!id || !user) {
    return null;
  }

  const userInfo = await fetchUser(user?.id);

  if (!userInfo?.onboarded) {
    return redirect("/onboarding");
  }

  const thread = await fetchThreadById(id);

  return (
    <section className="relative">
      <div className="">
        <ThreadCard
          id={id}
          currentUserId={user?.id || ""}
          parentId={thread?.parentId}
          content={thread?.text}
          author={thread?.author}
          community={thread?.community}
          createdAt={thread?.createdAt}
          comments={thread?.children}
        />
      </div>

      <div className="mt-7">
        <Comment />
      </div>
    </section>
  );
}

export default ThreadDetailPage;
