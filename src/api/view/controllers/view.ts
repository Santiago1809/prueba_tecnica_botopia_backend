/**
 * view controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::view.view",
  ({ strapi }) => ({
    async create(ctx) {
      const { data } = ctx.request.body;

      const product = await strapi.documents("api::product.product").findOne({
        documentId: data.product,
      });
      const response = await strapi.documents("api::view.view").create({
        data: {
          product: product.id,
          user: data.user,
        },
      });
      ctx.body = response;
    },
  })
);
