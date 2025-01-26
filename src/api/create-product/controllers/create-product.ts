/**
 * A set of functions called "actions" for `create-product`
 */

export default {
  async customCreate(ctx) {
    try {
      const { user } = ctx.state;
      const { user_role } = user;

      if (user_role !== "ADMIN") {
        ctx.status = 403;
        return (ctx.body = { error: "Unauthorized" });
      }
      const { Name, Price, Description, Stock, Category } = ctx.request.body;

      // Verifica que se reciban todos los datos requeridos
      if (!Name || !Price || !Stock || !Category) {
        return ctx.badRequest("Name, Price, Stock y Category son requeridos.");
      }

      // Manejar los archivos subidos (si los hay)
      const files = ctx.request.files?.Images;

      if (!files) {
        return ctx.badRequest("No se han subido imágenes.");
      }

      // Asegúrate de que `files` sea un arreglo
      const filesArray = Array.isArray(files) ? files : [files];
      const existingCategory = await strapi
        .documents("api::category.category")
        .findFirst({
          filters: {
            id: Category,
          },
        });

      if (!existingCategory) {
        return ctx.badRequest("La categoría no existe.");
      }

      const productData = {
        Name,
        Price,
        Description,
        Stock,
        Category: existingCategory.id, // Solo necesitas el ID
      };
      const newProduct = await strapi.documents("api::product.product").create({
        data: productData,
      });

      const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
        data: {
          ref: "api::product.product",
          refId: newProduct.id,
          field: "Images",
        },
        files: filesArray,
      });
      const updatedProduct = await strapi
        .documents("api::product.product")
        .update({
          documentId: newProduct.documentId,
          data: {
            Images: uploadedFiles.map((file) => file.id),
          },
          populate: {
            Images: {
              fields: ["url"],
            },
            Category: true,
          },
        });

      ctx.body = updatedProduct;
    } catch (error) {
      ctx.body = error;
    }
  },
};
