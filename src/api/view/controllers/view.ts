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
      const user = await strapi
        .documents("plugin::users-permissions.user")
        .findFirst({
          filters: {
            id: data.user,
          },
        });

      const response = await strapi.documents("api::view.view").create({
        data: {
          product: product.id,
          user: user.id,
        },
        status: "published",
      });
      ctx.body = response;
    },
  })
);
