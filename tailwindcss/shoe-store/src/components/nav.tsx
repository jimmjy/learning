"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  // const menuRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const onToggleMenuClick = () => {
    setIsMenuOpen((currentState) => !currentState);
  };

  // Maybe make a hook for this to reuse
  useEffect(() => {
    setIsMenuOpen(false);

    // const onOutsideClick = (event: MouseEvent) => {
    //   const clickedArea = event.target;
    //   const isMenuClicked = menuRef.current?.contains(
    //     clickedArea as HTMLElement,
    //   );
    //
    //   console.log(isMenuClicked);
    //
    //   if (!isMenuClicked) {
    //     setIsMenuOpen(false);
    //   }
    // };
    // // we need to add an outside click
    // window.addEventListener("click", onOutsideClick);
  }, [path]);

  // console.log({ path, isMenuOpen });
  return (
    // maybe not flexwrap but wait till end
    <nav className="flex flex-wrap justify-between items-center relative z-10">
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
        // ref={menuRef}
        className={`${!isMenuOpen && "hidden"} w-full lg:w-auto lg:block`}
      >
        <ul className="flex flex-col lg:flex-row lg:gap-8 text-lg border border-gray-200 lg:border-transparent bg-gray-50 lg:bg-transparent rounded-lg p-4">
          {ROUTES.map(({ href, name }) => (
            <li
              key={name}
              className={`flex px-3 py-2 cursor-pointer rounded hover:bg-gray-200 ${path === href && "bg-blue-500 text-white lg:bg-transparent lg:text-blue-500 pointer-events-none"} lg:nth-[4]:text-white lg:nth-[5]:text-white lg:hover:nth-[4]:text-blue-500 lg:hover:nth-[5]:text-blue-500 lg:hover:bg-transparent lg:hover:text-blue-500`}
            >
              <Link className="grow" href={href}>
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Cart Button */}
      <div className="fixed bottom-4 left-4 lg:static lg:mr-8">
        <div className="flex-center h-12 w-12 rounded-full bg-white shadow-md cursor-pointer">
          <TbShoppingBag />
        </div>
      </div>
    </nav>
  );
}
