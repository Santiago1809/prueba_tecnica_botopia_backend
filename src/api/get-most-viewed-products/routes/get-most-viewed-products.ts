export default {
  routes: [
    {
      method: "GET",
      path: "/get-most-viewed-products",
      handler: "get-most-viewed-products.getMostViewedProducts",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
