export default {
  routes: [
    {
      method: "POST",
      path: "/products/custom-create",
      handler: "create-product.customCreate",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
