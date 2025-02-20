import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { fetchCommunities } from "@/lib/actions/community.actions";
import CommunityCard from "@/components/cards/CommunityCard";
import Pagination from "@/components/shared/Pagination";
import Searchbar from "@/components/shared/Searchbar";

async function CommunitiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const userInfo = await fetchUser(user?.id);
  if (!userInfo?.onboarded) {
    return redirect(`/onboarding`);
  }

  const result = await fetchCommunities({
    searchString: searchParams?.q || "",
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  });

  return (
    <section className="">
      <h1 className="head-text mb-10">Communities</h1>

      {/* Search bar */}
      <div className="mt-5">
        <Searchbar routeType="communities" />
      </div>

      <div className="mt-14 flex flex-col gap-9">
        {result?.communities?.length === 0 ? (
          <p className="no-result">No users</p>
        ) : (
          <>
            {result?.communities?.map((community: any) => (
              <CommunityCard
                key={community?.id}
                id={community?.id}
                name={community?.name}
                username={community?.username}
                imgUrl={community?.image}
                bio={community?.bio}
                members={community?.members || []}
              />
            ))}
          </>
        )}
      </div>

      <Pagination
        path="communities"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </section>
  );
}

export default CommunitiesPage;
