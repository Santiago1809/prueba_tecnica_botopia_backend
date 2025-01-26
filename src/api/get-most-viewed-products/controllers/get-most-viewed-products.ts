/**
 * A set of functions called "actions" for `get-most-viewed-products`
 */

export default {
  getMostViewedProducts: async (ctx) => {
    try {
      const entries = await strapi.documents("api::product.product").findMany({
        populate: {
          Images: {
            fields: ["id", "url"],
          },
          Category: true,
          views: true,
        },
      });
      const productsViewsCount = entries
        .map((product) => ({
          id: product.id,
          attributes: {
            ...product,
            id: undefined,
            viewCount: product.views.length || 0,
            views: undefined,
          },
        }))
        .sort((a, b) => b.attributes.viewCount - a.attributes.viewCount)
        .slice(0, 4);
      return {
        data: productsViewsCount,
        meta: {
          count: productsViewsCount.length,
        },
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
