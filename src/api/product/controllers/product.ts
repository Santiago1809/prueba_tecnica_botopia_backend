/**
 * product controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    async update(ctx) {
      const { data } = ctx.request.body;
      try {
        const product = await strapi.documents("api::product.product").findOne({
          documentId: ctx.params.id,
        });
        if (!product) {
          ctx.throw(404, "Product not found");
        }
        const updatedProduct = await strapi
          .documents("api::product.product")
          .update({
            documentId: ctx.params.id,
            data,
            status: "published",
          });
        ctx.body = updatedProduct;
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);
