import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { profileTabs } from "@/constants";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThreadsTab from "@/components/shared/ThreadsTab";

async function ProfilePage({ params: { id } }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const userInfo = await fetchUser(id);
  if (!userInfo?.onboarded) {
    return redirect(`/onboarding`);
  }

  return (
    <section className="">
      <ProfileHeader
        accountId={userInfo?.id}
        authUserId={user?.id}
        name={userInfo?.name}
        username={userInfo?.username}
        imgUrl={userInfo?.image}
        bio={userInfo.bio}
      />

      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {profileTabs?.map((tab) => (
              <TabsTrigger key={tab?.label} value={tab?.value} className="tab">
                <Image
                  src={tab?.icon}
                  alt={tab?.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />

                <p className="max-sm:hidden">{tab?.label}</p>

                {tab?.label === "Threads" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {userInfo?.threads?.length || 0}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {profileTabs?.map((tab) => (
            <TabsContent
              key={`content-${tab?.label}`}
              value={tab?.value}
              className="w-full text-light-1"
            >
              <ThreadsTab
                currentUserId={user?.id}
                accountId={userInfo?.id}
                accountType="User"
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

export default ProfilePage;
