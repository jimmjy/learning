/**
 * Groups:
    For groups, we basically attach a class to parent, then reference  
    it in a child with a hyphen type to apply parent state to child.

    Groups only work from parent to child, so siblings can't trigger.

    Luckily, there is peer which is similar to group but for siblings.

    how can we distinguish which peer for multiples, you use a /name

    A peer element always have to be above the peer element that has the 
    action

    we can change the ordering of flex items with order-#. You should 
    add order to all elements or else the ones without will always be 
    at the top
 */
export default function Group() {
  return (
    <div className="border-2 bg-white p-6 hover:bg-sky-500 group">
      <p className="text-slate-500 group-hover:text-red-500">
        Create a new project
      </p>
      <p className="text-slate-500">Create a new project</p>
      <p className="text-slate-500">Create a new project</p>
      {/* reordering here */}
      <div className="flex flex-col bg-purple-400">
        <div className="order-3 peer/yellow h-12 w-12 bg-yellow-500"></div>
        <div className="peer/black h-12 w-12 bg-black"></div>
        <div className="order-1 hidden peer-hover/yellow:block">
          You are hovering the yellow square
        </div>
        <div className="order-2 hidden peer-hover/black:block">
          You are hovering the black square
        </div>
      </div>
    </div>
  );
}
