import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page() {
  // ? mengambil data user jika user belum login maka akan diarahkan ke halaman login
  const user = await currentUser();

  // ? jika tidak ada user/user belum login kembalikan null
  if (!user) return null;

  // ? cek apakah user sudah didaftarkan ke database atau belum
  const userInfo = await fetchUser(user.id);

  // ? jika belum terdaftar rederect ke onboarding
  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <>
      <h1 className="head-text">Create thread</h1>

      <PostThread userId={userInfo._id} />
    </>
  );
}

export default Page;
