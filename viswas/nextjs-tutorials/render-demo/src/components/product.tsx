export const Product = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log("the server");
  return <div>Product</div>;
};
