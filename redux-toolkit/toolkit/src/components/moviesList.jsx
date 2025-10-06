import { useDispatch, useSelector } from "react-redux";
import { removeMovie } from "../redux/movieSlice";

export const MovieList = () => {
  const { movies } = useSelector((state) => state.moviesList);
  const dispatch = useDispatch();

  console.log({ movies });
  return (
    <div>
      <h1>Movie List</h1>
      {movies.map((movie) => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            padding: "10px 0",
          }}
          key={movie.id}
        >
          <p>{movie.name}</p>
          <button onClick={() => dispatch(removeMovie(movie.id))}>
            Remove Movie
          </button>
        </div>
      ))}
    </div>
  );
};
