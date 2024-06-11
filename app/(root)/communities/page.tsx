import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

async function CommunitiesPage() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const userInfo = await fetchUser(user?.id);
  if (!userInfo?.onboarded) {
    return redirect(`/onboarding`);
  }

  return (
    <section className="">
      <h1 className="head-text mb-10">Communities</h1>
    </section>
  );
}

export default CommunitiesPage;
