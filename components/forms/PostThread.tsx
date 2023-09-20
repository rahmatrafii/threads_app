"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";
import { useState } from "react";

interface Props {
  userId: string;
}

const PostThread = ({ userId }: Props) => {
  const [btnIsLoading, setBtnIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // const { organization } = useOrganization();

  const form = useForm<z.infer<typeof ThreadValidation>>({
    // ? membuat validation pada form
    resolver: zodResolver(ThreadValidation),
    // ? membuat default value pada form
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  // ? ketika user mensubmit
  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    setBtnIsLoading(true);
    try {
      // ? menjalankan fungsi createThread dengan mengirimkan text,author,pathname dan communityId
      await createThread({
        text: values.thread,
        author: userId,
        communityId: null,
        path: pathname,
      });
      // ? arahkan ke halaman utama
      router.push("/");
    } catch (error: any) {
      throw new Error(`Error creating thread ${error.message}`);
    }
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {btnIsLoading ? (
          <Button
            disabled
            className="bg-primary-500 cursor-progress bg-opacity-50"
          >
            Loading....
          </Button>
        ) : (
          <Button type="submit" className="bg-primary-500">
            Post Thread
          </Button>
        )}
      </form>
    </Form>
  );
};

export default PostThread;
