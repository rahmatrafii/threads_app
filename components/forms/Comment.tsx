"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { CommentValidation } from "@/lib/validations/thread";
// import { createThread } from "@/lib/actions/thread.actions";
import { useState } from "react";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.actions";
import { userInfo } from "os";

interface Props {
  threadId: string;
  currentUserImage: string;
  currentUserId: string;
}
const Comment = ({ threadId, currentUserImage, currentUserId }: Props) => {
  const [btnIsLoading, setBtnIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // const { organization } = useOrganization();

  const form = useForm<z.infer<typeof CommentValidation>>({
    // ? membuat validation pada form
    resolver: zodResolver(CommentValidation),
    // ? membuat default value pada form
    defaultValues: {
      thread: "",
    },
  });

  // ? ketika user mensubmit
  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    setBtnIsLoading(true);
    try {
      await addCommentToThread(
        threadId,
        values.thread,
        JSON.parse(currentUserId),
        pathname
      );
      setBtnIsLoading(false);
      form.reset();
    } catch (error: any) {
      throw new Error(`Error creating thread ${error.message}`);
    }
  };
  return (
    <Form {...form}>
      <form className="comment-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full items-center gap-3">
              <FormLabel>
                <Image
                  src={currentUserImage}
                  alt="Profile Photo"
                  width={48}
                  height={48}
                  className=" w-11 h-11 rounded-full object-cover"
                />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input
                  className="no-focus text-light-1 outline-none"
                  type="text"
                  placeholder="Comment..."
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {btnIsLoading ? (
          <Button
            disabled
            className="comment-form_btn cursor-not-allowed bg-opacity-50"
          >
            Replying....
          </Button>
        ) : (
          <Button type="submit" className="comment-form_btn">
            Reply
          </Button>
        )}
      </form>
    </Form>
  );
};

export default Comment;
