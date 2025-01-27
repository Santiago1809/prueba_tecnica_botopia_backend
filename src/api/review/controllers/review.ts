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
    async create(ctx) {
      const { data } = ctx.request.body;

      const product = await strapi.documents("api::product.product").findOne({
        documentId: data.product,
      })

      await strapi.documents("api::review.review").create({
        data: {
          product: product.id,
          user: data.user,
          Text: data.Text,
        },
        status: "published"
      })
      const response = await strapi.entityService.findMany(
        "api::review.review",
        {
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
        }
      );

      return response;
    },
  })
);
