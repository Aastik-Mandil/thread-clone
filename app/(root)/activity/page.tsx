import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

async function ActivityPage() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const userInfo = await fetchUser(user?.id);
  if (!userInfo?.onboarded) {
    return redirect(`/onboarding`);
  }

  const activity = await getActivity(userInfo?._id);

  return (
    <section className="">
      <h1 className="head-text mb-10">Activity</h1>

      <section className="mt-10 flex flex-col gap-5">
        {activity?.length > 0 ? (
          <>
            {activity?.map((ac: any) => (
              <Link key={ac?._id} href={`/thread/${ac?.parentId}`}>
                <article className="activity-card">
                  <Image
                    src={ac?.author?.image}
                    alt="Profile picture"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />

                  <p className="!text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500">
                      {ac?.author?.name}
                    </span>{" "}
                    replied to your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3">No activity yet</p>
        )}
      </section>
    </section>
  );
}

export default ActivityPage;
