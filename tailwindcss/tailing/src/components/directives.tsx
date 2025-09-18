/**
 * Tailwind will remove all the default styling (reset)
 */
export default function Directives() {
  return (
    <div>
      <h1>Welcome to Our Website</h1>

      <h2>Tailwind is pretty cool</h2>
      <p>Here : a lot of reasons why tailwind is cool</p>

      <h2>React is pretty cool</h2>
      <p>Here : a lot of reasons why React is cool</p>

      <h2>NodeJS is pretty cool</h2>
      <p>Here : a lot of reasons why NodeJS is cool</p>

      <div className="flex gap-2 p-2">
        <button className="btn-danger">Delete</button>
        <button className="btn-danger">Danger</button>
      </div>

      <div className="h-44 bg-blue-200 flex-center">
        <p>HI</p>
      </div>
    </div>
  );
}
