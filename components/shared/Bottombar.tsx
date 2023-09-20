"use client";
import { sidebarLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Bottombar = () => {
  const pathName = usePathname();
  return (
    <section className="bottombar">
      <div className="bottombar_container">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathName.includes(link.route) && pathName.length > 1) ||
            pathName === link.route;
          return (
            <Link
              href={link.route}
              key={link.route}
              className={`bottombar_link ${isActive && "bg-primary-500"}`}
            >
              <Image
                alt={link.label}
                src={link.imgURL}
                width={24}
                height={24}
              />
              <p className="text-light-1 text-subtle-medium max-sm:hidden whitespace-nowrap">
                {link.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Bottombar;
