/**
 * Groups:
    For groups, we basically attach a class to parent, then reference  
    it in a child with a hyphen type to apply parent state to child
 */
export default function Group() {
  return (
    <div className="border-2 bg-white p-6 hover:bg-sky-500 group">
      <p className="text-slate-500 group-hover:text-red-500">
        Create a new project
      </p>
      <p className="text-slate-500">Create a new project</p>
      <p className="text-slate-500">Create a new project</p>
    </div>
  );
}
