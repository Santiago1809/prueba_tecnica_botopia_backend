/**
 * A set of functions called "actions" for `report-new-sale`
 */

export default {
  reportSale: async (ctx) => {
    try {
      const { Products, sendingData, totalPrice } = ctx.request.body;

      if (!Array.isArray(Products)) {
        ctx.throw(400, "Products must be an array");
      }

      const user = await strapi
        .documents("plugin::users-permissions.user")
        .findFirst({
          filters: {
            email: sendingData.email,
          },
        });

      await strapi.documents("api::order.order").create({
        data: {
          Products,
          PaymentMethod: sendingData.paymentMethod,
          user: user.id,
          TotalPrice: totalPrice,
          DeliveryAddress: sendingData.address,
          Country: sendingData.country,
          City: sendingData.city,
        },
        status: "published",
      });

      for (const item of Products) {
        const product = await strapi.entityService.findOne(
          "api::product.product",
          item.id
        );

        if (!product) {
          ctx.throw(404, `Product with id ${item.id} not found`);
        }

        if (product.Stock < item.quantity) {
          ctx.throw(400, `Insufficient stock for product ${product.id}`);
        }

        await strapi.documents("api::product.product").update({
          documentId: item.documentId,
          data: {
            Stock: product.Stock - item.quantity,
          },
          status: "published",
        });
      }

      ctx.body = { message: "Stock updated successfully" };
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
    }
  },
  getSalesByUser: async (ctx) => {
    try {
      const { user: userParam } = await ctx.params;
      const user = await strapi
        .documents("plugin::users-permissions.user")
        .findFirst({
          filters: {
            username: userParam,
          },
        });
      const sales = await strapi.entityService.findMany("api::order.order", {
        filters: {
          user: {
            id: {
              $eq: user.id,
            },
          },
        },
        sort: { createdAt: "desc" },
        limit: 100,
      });
      for (const sale of sales) {
        const productsArray = Array.isArray(sale.Products)
          ? (sale.Products as { documentId: string; quantity: number }[])
          : [];
        const productsPromises = productsArray.map(async (product) => {
          const fetchedProduct = await strapi
            .documents("api::product.product")
            .findOne({
              documentId: (product as { documentId: string }).documentId,
              select: ["documentId", "Name", "Price"],
            });
          return {
            documentId: fetchedProduct.documentId || "",
            Name: fetchedProduct.Name,
            Price: fetchedProduct.Price,
            quantity: product.quantity,
          };
        });
        sale.Products = await Promise.all(productsPromises);
      }
      ctx.body = sales;
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
    }
  },
  getSales: async (ctx) => {
    try {
      const sales = await strapi.documents("api::order.order").findMany({
        sort: { createdAt: "desc" },
        populate: {
          user: {
            fields: ["display_name", "email", "user_role", "username"],
          },
        },
        limit: 100,
      });
      for (const sale of sales) {
        if (Array.isArray(sale.Products)) {
          const productsPromises = sale.Products.map(async (product) => {
            if (
              typeof product !== "object" ||
              product === null ||
              !("quantity" in product)
            ) {
              throw new Error("Quantity property not found");
            }

            const fetchedProduct = await strapi
              .documents("api::product.product")
              .findOne({
                documentId: product["documentId"] as string,
                select: ["documentId", "Name", "Price"],
              });
            return {
              documentId: fetchedProduct.documentId || "",
              Name: fetchedProduct.Name,
              Price: fetchedProduct.Price,
              quantity: product.quantity,
            };
          });
          sale.Products = await Promise.all(productsPromises);
        }
      }
      ctx.body = sales;
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
    }
  },
};
