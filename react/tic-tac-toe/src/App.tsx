import { useState } from "react";
import "./App.css";

function App() {
  const [test, setTest] = useState("testing");

  return (
    <>
      <div>{test}</div>
      <button onClick={() => setTest("hello")} type="button">
        Testing
      </button>
    </>
  );
}

export default App;
