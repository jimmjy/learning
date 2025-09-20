import Image from "next/image";
import Link from "next/link";

import shoe from "../../public/n1-min.png";
import Select from "@/components/select";

import { QTY, SIZES } from "@/utils/constants";

// space-x-10 or space-y-10 this is good for none flex items

export default function ShoeDetail() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse">
      {/* Shoe image */}
      <div className="flex-1 lg:-mt-32 lg:ml-28">
        <div className="flex justify-center items-center h-full bg-gradient-to-br from-[#F637CF] via-[#e3d876] via-40% to-[#4dd4c6]">
          <Image
            alt="shoe"
            src={shoe}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      </div>
      {/* shoe details */}
      <div className="flex-1 space-y-8">
        <p className="text-5xl font-black md:text-9xl">Nike Air Max 270</p>
        <p className="font-medium md:text-xl">
          {
            "The Nike Air Max 270 is a lifestyle shoe that's sure to turn heads with its vibrant color gradient."
          }
        </p>
        <p className="text-3xl font-extrabold md:text-6xl">$ 100</p>
        <Select title="QTY" options={QTY} />
        <Select title="SIZE" options={SIZES} />
        <div className="flex gap-10 items-center">
          <button className="h-14 w-44 bg-black text-white rounded hover:bg-gray-700 active:bg-gray-500 focus:outline-2 focus:outline-red-400">
            Add to bag
          </button>
          <Link
            href="#"
            className="text-lg font-bold underline underline-offset-4"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
