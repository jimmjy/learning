"use client";

import { useRouter } from "next/navigation";

export default function OrderProduct() {
  const router = useRouter();
  const handleClick = () => {
    console.log("Placing your order");
    router.push("/");
  };

  return (
    <div className="p-4 flex flex-col gap-8 border-1">
      <div>Order Product</div>
      <button
        className="border-1 rounded p-4 bg-blue-400 w-48"
        onClick={handleClick}
      >
        Place Order
      </button>
    </div>
  );
}
