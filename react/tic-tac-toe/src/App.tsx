import { useState } from "react";
import "./App.css";

const ButtonOne = () => {
  const [name, setName] = useState("billy");

  return (
    <div className="hello">
      <div></div>
      <button type="button" onClick={() => setName("James")}>
        {name}
      </button>
    </div>
  );
};

function App() {
  const [test, setTest] = useState("testing");

  return (
    <>
      <div>{test}</div>
      <button onClick={() => setTest("hello")} type="button">
        Testing
      </button>
      <button type="button" onClick={() => setTest("hello")}>
        Testing
      </button>
      <ButtonOne />
    </>
  );
}

export default App;
