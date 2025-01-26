/**
 * A set of functions called "actions" for `create-banner`
 */

export default {
  customCreate: async (ctx) => {
    try {
      const { user } = ctx.state;
      const { user_role } = user;

      if (user_role !== "ADMIN") {
        ctx.status = 403;
        return (ctx.body = { error: "Unauthorized" });
      }

      const { Title, Url, ButtonText } = ctx.request.body;

      if (!Title || !Url || !ButtonText) {
        ctx.status = 400;
        return (ctx.body = { error: "Missing required fields" });
      }

      const file = ctx.request.files?.Image;

      if (!file) {
        ctx.status = 400;
        return (ctx.body = { error: "Missing Image" });
      }

      const newBanner = await strapi.documents("api::banner.banner").create({
        data: {
          Title,
          Url,
          ButtonText,
        },
        status: "published",
      });

      const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
        data: {
          ref: "api::banner.banner",
          refId: newBanner.id,
          field: "Image",
        },
        files: file,
      });

      const updatedBanner = await strapi
        .documents("api::banner.banner")
        .update({
          documentId: newBanner.documentId,
          data: {
            Image: uploadedFiles[0].id,
          },
          populate: {
            Image: {
              fields: ["url"],
            },
          },
          status: "published",
        });

      ctx.body = updatedBanner;
    } catch (err) {
      ctx.body = err;
    }
  },
};
