"use server";
import { revalidatePath } from "next/cache";
import Thread from "../modles/thread.models";
import User from "../modles/user.models";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}
// ? fungsi untuk membuat thread
export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    // ? memnyimpan thead ke database
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // ? mengupdate data user dengan id thread yang baru dibuat
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    console.log(error.message);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // ? Hitung jumlah postingan yang harus dilewati berdasarkan nomor halaman dan ukuran halaman.
  const skipAmount = (pageNumber - 1) * pageSize;

  // ? mencari postingan pertama dan bukan komentar
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    // ? mencari postingan dari yang terbaru hingga terlama
    .sort({ createdAt: "desc" })
    // ? mengatur jumlah postingan yang diskip
    .skip(skipAmount)
    // ? mengatur jumlah postingan yang ditampilkan
    .limit(pageSize)
    // ? mengambil data penulis dari tabel User dan menggabungkannya dengan data posting.
    .populate({
      path: "author",
      model: User,
    })
    // ? Ini adalah nested populate yang digunakan untuk mengambil data komentar (children) dari posting dan data penulis dari komentar tersebut. Hanya beberapa properti yang diambil dari penulis komentar, yaitu _id, name, parentId, dan image.
    // ? mengambil komentar dari posting
    .populate({
      path: "children",
      // ?  mengambil data orang yang memberi komentar
      populate: {
        path: "author",
        model: User,
        // ? hanya mengambil id, name, parentId, dan image
        select: "_id name parentId image",
      },
    });

  // ? mengambil semua thread utama yang tidak memiliki parent atau bukan komentar
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  // ? Menjalankan query yang telah dikonfigurasi dan menunggu hasilnya, kemudian hasilnya akan disimpan dalam variabel "posts"
  const posts = await postsQuery.exec();
  console.log(posts.length);

  const isNext = totalPostsCount > skipAmount + posts.length;
  console.log(isNext);

  return { posts, isNext };
}

export async function fetchThreadById(threadId: string) {
  // ? mengkoneksikan ke database
  connectToDB();

  try {
    // ? mencari thread berdasarkan id yang dikirim
    const thread = await Thread.findById(threadId)
      // ? mengambil data author dari thread tersebut
      .populate({
        path: "author",
        model: User,
        // ? mengambil _id , id name dan image
        select: "_id id name image",
      })
      // ? mengambil comentar dari thread
      .populate({
        path: "children",
        populate: [
          // ? mengambil data dari orang yang memberikan komentar
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          // ? megambil komentar dari kometar / nested komentar
          {
            path: "children",
            model: Thread,
            // ? mengambil data dari orang yang memberikan komentar
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addComment(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // ? cari thread asli
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) {
      throw new Error("Thread not found");
    }

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    // ? Simpan comment di database
    const savedCommentThread = await commentThread.save();

    // ? Tambahkan ID thread komentar ke array anak thread asli
    originalThread.children.push(savedCommentThread._id);

    // ? Simpan thread asli yang diperbarui ke database
    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding Comment to thread ${error.message}`);
  }
}
