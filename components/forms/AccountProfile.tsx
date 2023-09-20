"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserValidations } from "@/lib/validations/user";
import * as z from "zod";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { Textarea } from "../ui/textarea";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

const AccountProfile = ({ user, btnTitle }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [btnIsLoading, setBtnIsLoading] = useState(false);
  const { startUpload } = useUploadThing("media");
  const pathName = usePathname();
  const router = useRouter();
  console.log(user);

  const form = useForm({
    // ? membuat user validation dari UserValidations
    resolver: zodResolver(UserValidations),
    // ? membuat default value
    defaultValues: {
      profile_photo: user?.image || "",
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
    },
  });

  // ? ketika user memasukkan image
  const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();
    console.log(e.target.files);
    // ? FileReader adalah objek yang digunakan untuk membaca isi dari berkas (file) yang dipilih oleh pengguna melalui elemen input berkas (file input) dalam halaman web.
    const fileReader = new FileReader();

    // ? dicek apakah e.target.files ada dan kalo ada lengthnya lebih dari 0 atau tidak
    if (e.target.files && e.target.files.length > 0) {
      // ? ambil isinya
      const file = e.target.files[0];
      // ? set files dengan data image
      setFiles(Array.from(e.target.files));

      // ? jika yang dimasukkan bukan image return kosong
      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        // ? ambil link url gambar yang dikirim user dan ubah menjadi string
        const imageDataUrl = event.target?.result?.toString() || "";

        // ? lalu tampilka
        fieldChange(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
    }
  };

  //  ? ketika user mengklik mensubmit form
  async function onSubmit(values: z.infer<typeof UserValidations>) {
    setBtnIsLoading(true);
    // ? ambil image dari parameter values
    const blob = values.profile_photo;
    // ? cek apakah yang dimasukan itu standar base64 image
    const hasImageChanged = isBase64Image(blob);

    // ? jika hasImageChanged = true
    if (hasImageChanged) {
      // ? menguplad image
      const imgRes = await startUpload(files);
      console.log(imgRes);

      // ? jika berhasil
      if (imgRes && imgRes[0].url) {
        // ? ubah values.profile_photo dengan image yang dimasukkan
        values.profile_photo = imgRes[0].url;
      }
    }

    // ? mengupdate/memsaukkan user kedalam database dengan function updateUser
    await updateUser({
      name: values.name,
      path: pathName,
      username: values.username,
      userId: user.id,
      bio: values.bio,
      image: values.profile_photo,
    });

    // ? jika pathname berada di "/profile/edit" kembalikikan
    if (pathName === "/profile/edit") {
      router.back();
    }
    // ? jika pathname berada di selain "/profile/edit" kembalikikan ke halam utama
    else {
      router.push("/");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="account-form_image-label">
                {field.value ? (
                  <Image
                    src={field.value}
                    alt="profile_icon"
                    width={96}
                    height={96}
                    priority
                    className="rounded-full object-contain"
                  />
                ) : (
                  <Image
                    src="/assets/profile.svg"
                    alt="profile_icon"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                )}
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200">
                <Input
                  type="file"
                  accept="image/*"
                  placeholder="Add profile photo"
                  className="account-form_image-input"
                  // ? kirim data dan fungsi onChange ke handleImage
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Username
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Bio
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {btnIsLoading ? (
          <Button
            disabled
            className="cursor-not-allowed bg-primary-500 bg-opacity-50 "
          >
            Loading...
          </Button>
        ) : (
          <Button type="submit" className="bg-primary-500">
            Submit
          </Button>
        )}
      </form>
    </Form>
  );
};

export default AccountProfile;
