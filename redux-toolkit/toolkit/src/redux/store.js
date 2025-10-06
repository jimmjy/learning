import { configureStore } from "@reduxjs/toolkit";
import movieReducer from "./movieSlice.js";

export const store = configureStore({
  reducer: { moviesList: movieReducer },
});

/*
  What is a reducer?

  A reducer is a function that specifies how the state will change based on an action.
  I takes in a state and an action.

  The state for a reducer is the current state for a particular portion the reducer is tied to.

  The action is an object that will describe what happened in application and will typically 
  have an action tied to it for what to do.

  The reducer will have access.

  Slices allow us to segment our states
*/
// what is a reducer? A reducer is suppose specifies how the state should change
