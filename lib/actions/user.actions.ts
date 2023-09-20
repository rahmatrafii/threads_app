"use server";

import { revalidatePath } from "next/cache";
import User from "../modles/user.models";
import Thread from "../modles/thread.models";
import { connectToDB } from "../mongoose";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

// ? function updateUser menerima userId, bio,  name, path, username,image,
export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    // ? mengkonect kan ke database
    connectToDB();

    // ? mengupdate user
    await User.findOneAndUpdate(
      // ? id user
      { id: userId },
      // ? datanya
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      //   ? memperbarui data jika sudah ada memasukkan data jika belumm ada
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId });
    // .populate({
    //   path: "communities",
    //   model: Community,
    // });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  connectToDB();

  try {
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
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
  } catch (error: any) {
    throw new Error(`Error Fetching User Thread ${error.message}`);
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

    // Calculate the number of users to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter users.
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, // Exclude the current user from the results.
    };

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the search criteria (without pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page.
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error: any) {
    console.error("Error fetching users:", error.message);
    throw error;
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();
    // ? Temukan semua thread yang dibuat oleh pengguna
    const userThreads = await Thread.find({ author: userId });

    // ? Kumpulkan semua id thread anak (balasan) dari kolom 'anak' di setiap thread pengguna
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    // ? Temukan dan kembalikan thread anak (balasan) tidak termasuk yang dibuat oleh pengguna yang sama
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // ? Kecualikan thread yang dibuat oleh pengguna yang sama
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error: any) {
    throw new Error("failed to fetch Actity", error.message);
  }
}
