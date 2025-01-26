export default {
  routes: [
    {
      method: "POST",
      path: "/report-new-sale",
      handler: "report-new-sale.reportSale",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/get-sales/:user",
      handler: "report-new-sale.getSalesByUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/get-sales",
      handler: "report-new-sale.getSales",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
