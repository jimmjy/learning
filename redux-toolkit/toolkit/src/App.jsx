import "./App.css";

import { MovieInput } from "./components/movieInput";
import { MovieList } from "./components/moviesList";

function App() {
  const [state, setState] = useState(initValue);
  return (
    <div>
      <MovieInput />
      <MovieList />
      <p>{state}</p>
      <button onClick={setState} type="button">
        tsting
      </button>
    </div>
  );
}

export default App;
