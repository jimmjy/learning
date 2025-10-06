import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  movies: [
    {
      id: 1,
      name: "Interstellar",
    },
    {
      id: 2,
      name: "Harry Potter",
    },
  ],
};

// The state in reducers holds just the movie state
const movieSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    // state comes automatically, we don't pass it
    addMovie: (state, action) => {
      const moviesLength = state.movies.length;
      const newMovie = {
        id: state.movies[moviesLength - 1].id + 1,
        name: action.payload,
      };

      state.movies.push(newMovie);
    },
    removeMovie: (state, action) => {
      const movieId = action.payload;

      const filteredMovies = state.movies.filter(
        (movie) => movie.id !== movieId,
      );

      state.movies = filteredMovies.map((movie, index) => ({
        ...movie,
        id: index + 1,
      }));
    },
  },
});

// export action creators - these are the old objects {type: "ADD_MOVIE", payload: "Payload_Data"}
export const { addMovie, removeMovie } = movieSlice.actions;

// export the movie slice reducers so we can import into store
export default movieSlice.reducer;
