import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.actions";
async function page() {
  // ? ambil data user dari calrk
  const user = await currentUser();

  if (!user) return null;

  // ? ambil data user dari database
  const userFormDatabase = await fetchUser(user?.id);

  // ? masukkan ke userInfo
  const userInfo: any = {
    bio: userFormDatabase?.bio,
    image: userFormDatabase?.image,
    name: userFormDatabase?.name,
    username: userFormDatabase?.username,
  };

  // ? mendefinisikan userData
  const userData = {
    id: user?.id,
    objectId: userInfo?._id,
    username: user?.username || userInfo?.username,
    name: userInfo?.name || user?.firstName || "",
    bio: userInfo?.bio || "",
    image: userInfo?.image || user?.imageUrl,
  };
  return (
    <main className="mx-auto max-w-3xl flex flex-col px-10 py-20 justify-start">
      <h1 className="head-text">Onboarding</h1>
      <p className="text-base-regular text-light-2">
        Complite your profile now to use Threads
      </p>

      <section className="mt-9 p-10 bg-dark-2">
        <AccountProfile user={userData} btnTitle="continue" />
      </section>
    </main>
  );
}

export default page;
