"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { RxHamburgerMenu } from "react-icons/rx";
import { TbShoppingBag } from "react-icons/tb";

const ROUTES = [
  {
    href: "/",
    name: "Home",
  },
  {
    href: "/about",
    name: "About",
  },
  {
    href: "/services",
    name: "Services",
  },
  {
    href: "/pricing",
    name: "Pricing",
  },
  {
    href: "/contact",
    name: "Contact",
  },
];

export default function Nav() {
  const path = usePathname();
  const menuRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const onToggleMenuClick = () => {
    setIsMenuOpen((currentState) => !currentState);
  };

  useEffect(() => {
    setIsMenuOpen(false);
    // we need to add an outside click
    window.addEventListener("click", (event: PointerEvent) => {
      // capture where clicked
      const clickedArea = event.target;
      console.log(clickedArea);
    });
  }, [path]);

  // console.log({ path, isMenuOpen });
  return (
    // maybe not flexwrap but wait till end
    <nav className="flex flex-wrap justify-between items-center">
      <Link href="#">
        <Image src={"/nike-logo.svg"} alt="Nike Logo" width={80} height={80} />
      </Link>
      {/* Burger Button */}
      <button
        className="p-2 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 lg:hidden"
        onClick={onToggleMenuClick}
      >
        <RxHamburgerMenu size={25} />
      </button>
      {/* Menu List */}
      <div
        ref={menuRef}
        className={`${!isMenuOpen && "hidden"} w-full lg:w-auto lg:block`}
      >
        <ul className="flex  flex-col lg:flex-row lg:gap-8 text-lg border border-gray-200 lg:border-transparent bg-gray-50 lg:bg-transparent rounded-lg p-4">
          {ROUTES.map(({ href, name }) => (
            <li
              key={name}
              className={`flex px-3 py-2 cursor-pointer rounded hover:bg-gray-200 ${path === href && "bg-blue-500 text-white lg:bg-transparent lg:text-blue-500 pointer-events-none"}`}
              // className="px-3 py-2 cursor-pointer rounded hover:not-first:bg-gray-200 first:bg-blue-500 lg:first:bg-transparent first:text-white lg:first:text-blue-500"
            >
              <Link href={href}>{name}</Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Cart Button */}
      <div className="fixed bottom-4 left-4 lg:static">
        <div className="flex-center h-12 w-12 rounded-full bg-white shadow-md">
          <TbShoppingBag />
        </div>
      </div>
    </nav>
  );
}
