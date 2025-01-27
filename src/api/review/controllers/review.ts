/**
 * review controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::review.review",
  ({ strapi }) => ({
    async findOne(ctx) {
      const { id } = ctx.params;
      const product = await strapi.documents("api::product.product").findOne({
        documentId: id,
      });
      const response = await strapi.documents("api::review.review").findMany({
        filters: {
          product: {
            id: {
              $eq: product.id,
            },
          },
        },
        populate: {
          user: {
            fields: ["display_name"],
          },
        },
      });

      ctx.body = response;
    },
  })
);
