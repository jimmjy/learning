import DarkMode from "@/components/dark-mode";
import Directives from "@/components/directives";
import Group from "@/components/group";
import Responsive from "@/components/responsive";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <div className="hidden h-screen grid-cols-3">
        <div className="h-12 w-12 bg-green-500">Hello</div>
        <div className="h-12 w-12 bg-red-500">My</div>
        <div className="h-12 w-12 bg-blue-500">Friend</div>
        <div className="h-12 w-12 bg-green-500">Hello</div>
        <div className="h-12 w-12 bg-red-500">My</div>
        <div className="h-12 w-12 bg-blue-500">Friend</div>
        <div className="h-12 w-12 bg-green-500">Hello</div>
        <div className="h-12 w-12 bg-red-500">My</div>
        <div className="h-12 w-12 bg-blue-500">Friend</div>
      </div>
      <Responsive style="hidden" />
      <button className="m-4 rounded-md bg-indigo-500 px-4 py-2 text-white lg:hover:bg-red-600 active:bg-red-500">
        click me
      </button>
      <div>
        <Group />
      </div>
      <div className="border-1 p-4 flex flex-col gap-4">
        <p>Button with custom values</p>
        <button className="outline-1 outline-mint bg-[#3da10a] px-[6.2px] py-2 rounded-[200px] size-fit">
          Custom Value
        </button>
      </div>
      <Directives />
      <DarkMode />
    </div>
  );
}

// first:bg-green-400; only works for first element
// sm:hover:bg-indigo-600; applies to sm and larger
