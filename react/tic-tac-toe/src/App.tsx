import { useState } from "react";
import "./App.css";

function App() {
  // const [count, setCount] = useState(0);
  const [test, setTest] = useState("testing");

  return (
    <>
      <div>{test}</div>
      <button onClick={() => setTest("hello")}>Testing</button>
    </>
  );
}

export default App;
