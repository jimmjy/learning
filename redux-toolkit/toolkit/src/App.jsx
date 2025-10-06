import "./App.css";
import { MovieInput } from "./components/movieInput";
import { MovieList } from "./components/moviesList";

function App() {
  return (
    <div>
      <MovieInput />
      <MovieList />
    </div>
  );
}

export default App;
