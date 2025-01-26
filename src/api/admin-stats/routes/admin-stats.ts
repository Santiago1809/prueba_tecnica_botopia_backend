export default {
  routes: [
    {
      method: "GET",
      path: "/admin-stats",
      handler: "admin-stats.getStats",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
