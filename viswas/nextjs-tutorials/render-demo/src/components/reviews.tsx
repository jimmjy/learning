export const Reviews = async () => {
  await new Promise((resolve) => setTimeout(resolve, 4000));

  console.log("reviews page as a server in a child");
  return <div>Reviews</div>;
};
