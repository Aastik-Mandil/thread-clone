"use server";

import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId?: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();
    const createdThread = await Thread.create({
      text,
      author,
      community: communityId,
    });

    // update user model with thread-id
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread?._id },
    });

    revalidatePath(path);
  } catch (err: any) {
    throw new Error(`Failed to create thread: ${err?.message}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    // calculate te number of threads to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    // fetc te Threads that have no parents (top-level threads...)
    const threads = await Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      })
      .exec();

    const totalThreadCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const isNext = totalThreadCount > skipAmount + threads.length;

    return { threads, isNext };
  } catch (err: any) {
    throw new Error(`Failed to fetch threads: ${err?.message}`);
  }
}

export async function fetchThreadById(id: string) {
  try {
    connectToDB();

    const thread = await Thread.findById(id)
      .populate({ path: "author", model: User, select: "_id id name image" })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err: any) {
    throw new Error(`Failed to fetch thread: ${err?.message}`);
  }
}
