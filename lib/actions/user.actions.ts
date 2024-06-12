"use server";

import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";
import Community from "../models/community.model";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  try {
    connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (err: any) {
    throw new Error(`Failed to create/update user: ${err?.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();
    return await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
  } catch (err: any) {
    throw new Error(`Failed to fetch user: ${err?.message}`);
  }
}

export async function fetchUserThreads(userId: string) {
  try {
    connectToDB();

    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id",
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id",
          },
        },
      ],
    });

    return threads;
  } catch (err: any) {
    throw new Error(`Failed to fetch user's Threads: ${err?.message}`);
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString?.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .exec();

    const totalUsersCount = await User.countDocuments(query);

    const isNext = totalUsersCount > skipAmount + users?.length;

    return { users, totalUsersCount, isNext };
  } catch (err: any) {
    throw new Error(`Failed to fetch users: ${err?.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // fetch all the threads created by user
    const userThreads = await Thread.find({ author: userId });

    // collect all the child threads ids (replies) from the 'children' field
    const childThreadIds = userThreads?.reduce(
      (acc, userThread) => acc?.concat(userThread?.children),
      []
    );

    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (err: any) {
    throw new Error(`Failed to fetch activity: ${err?.message}`);
  }
}
