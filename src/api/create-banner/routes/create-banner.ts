export default {
  routes: [
    {
      method: "POST",
      path: "/banners/create-banner",
      handler: "create-banner.customCreate",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
