export default {
  routes: [
    {
      method: "GET",
      path: "/recommendations",
      handler: "recommendations.getRecommendations",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/public/recommendations",
      handler: "recommendations.getRandomRecommendations",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
