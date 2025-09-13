import "server-only";

export const serverSideFunction = () => {
  console.log("this is some random message, but we do server based things");

  return "server results";
};
