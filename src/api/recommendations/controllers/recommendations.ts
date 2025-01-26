/**
 * A set of functions called "actions" for `recommendations`
 */

export default {
  async getRecommendations(ctx) {
    try {
      const { user } = ctx.state;

      const userViews = await strapi.documents("api::view.view").findMany({
        filters: {
          user: user.id,
        },
        populate: {
          product: {
            populate: ["Category", "Images"],
          },
        },
        sort: { createdAt: "desc" },
      });

      const uniqueProductIds = new Set();
      const uniqueProductNames = new Set();

      // Añadimos los productos ya vistos al conjunto de únicos
      userViews.forEach((view) => {
        if (view.product) {
          uniqueProductIds.add(view.product.id);
          uniqueProductNames.add(view.product.Name.toLowerCase()); // Normalizar a minúsculas
        }
      });

      // Analizar las preferencias de categorías del usuario
      const categoryAnalysis = userViews.reduce((acc, view) => {
        const categoryId = view.product?.Category?.id;
        if (categoryId) {
          acc[categoryId] = (acc[categoryId] || 0) + 1;
        }
        return acc;
      }, {});

      // Obtener las categorías más vistas por el usuario
      const topCategoryIds = Object.entries(categoryAnalysis)
        .sort(([, a], [, b]) => Number(b) - Number(a))
        .slice(0, 3)
        .map(([categoryId]) => parseInt(categoryId));

      const recommendedProducts = await strapi.db
        .query("api::product.product")
        .findMany({
          where: {
            Category: {
              id: {
                $in: topCategoryIds,
              },
            },
            Stock: {
              $gt: 0,
            },
            id: {
              $notIn: Array.from(uniqueProductIds),
            },
          },
          populate: {
            Images: true,
            Category: true,
            views: {
              count: true,
            },
          },
          limit: 20, // Aumentamos el límite para tener más opciones de filtrado
        });
      const filteredRecommendedProducts = recommendedProducts
        .filter((product) => {
          const normalizedName = product.Name.toLowerCase();
          if (!uniqueProductNames.has(normalizedName)) {
            uniqueProductIds.add(product.id);
            uniqueProductNames.add(normalizedName);
            return true;
          }
          return false;
        })
        .slice(0, 10); // Limitamos a 10 productos después del filtrado

      // Obtener productos populares de la tienda
      const popularProducts = await strapi
        .documents("api::product.product")
        .findMany({
          where: {
            Stock: {
              $gt: 0,
            },
            id: {
              $notIn: Array.from(uniqueProductIds),
            },
          },
          populate: {
            Images: true,
            Category: true,
            views: true,
          },
          limit: 20, // Aumentamos el límite para tener más opciones
        });

      // Ordenar y filtrar productos populares asegurando nombres únicos
      const filteredPopularProducts = popularProducts
        .sort((a, b) => (b.views?.length || 0) - (a.views?.length || 0))
        .filter((product) => {
          const normalizedName = product.Name.toLowerCase();
          if (!uniqueProductNames.has(normalizedName)) {
            uniqueProductIds.add(product.id);
            uniqueProductNames.add(normalizedName);
            return true;
          }
          return false;
        })
        .slice(0, 5);

      // Mapear los resultados filtrados
      return {
        categoryBased: filteredRecommendedProducts.map((product) => ({
          id: product.id,
          documentId: product.documentId,
          name: product.Name,
          description: product.Description,
          price: product.Price,
          images: product.Images.map((image) => image.url),
          category: {
            documentId: product.Category?.documentId,
            Name: product.Category?.Name,
          },
          stock: product.Stock,
        })),
        popular: filteredPopularProducts.map((product) => ({
          id: product.id,
          documentId: product.documentId,
          name: product.Name,
          description: product.Description,
          price: product.Price,
          images: product.Images.map((image) => image.url),
          category: {
            documentId: product.Category?.documentId,
            Name: product.Category?.Name,
          },
          stock: product.Stock,
          viewCount: product.views?.length || 0,
        })),
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  async getRandomRecommendations(ctx) {
    try {
      const categories = await strapi
        .documents("api::category.category")
        .findMany({
          limit: 5,
        });
      const categoryIds = categories.map((cat) => cat.id);
      const uniqueProductIds = new Set();
      const uniqueProductNames = new Set();

      // Get random products from these categories
      const randomProducts = await strapi.db
        .query("api::product.product")
        .findMany({
          where: {
            Category: {
              id: {
                $in: categoryIds,
              },
            },
            Stock: {
              $gt: 0,
            },
          },
          populate: {
            Images: true,
            Category: true,
            views: true,
          },
          limit: 20,
        });

      // Filter and track random products
      const filteredRandomProducts = randomProducts.filter((product) => {
        const normalizedName = product.Name.toLowerCase();
        if (!uniqueProductNames.has(normalizedName)) {
          uniqueProductIds.add(product.id);
          uniqueProductNames.add(normalizedName);
          return true;
        }
        return false;
      });

      // Get popular products excluding those in random
      const popularProducts = await strapi
        .documents("api::product.product")
        .findMany({
          where: {
            Stock: {
              $gt: 0,
            },
            id: {
              $notIn: Array.from(uniqueProductIds),
            },
          },
          populate: {
            Images: true,
            Category: true,
            views: true,
          },
          limit: 10,
        });

      // Filter popular products to ensure unique names
      const filteredPopularProducts = popularProducts
        .sort((a, b) => (b.views?.length || 0) - (a.views?.length || 0))
        .filter((product) => {
          const normalizedName = product.Name.toLowerCase();
          if (!uniqueProductNames.has(normalizedName)) {
            uniqueProductIds.add(product.id);
            uniqueProductNames.add(normalizedName);
            return true;
          }
          return false;
        })
        .slice(0, 5);

      return {
        random: filteredRandomProducts.map((product) => ({
          id: product.id,
          documentId: product.documentId,
          name: product.Name,
          description: product.Description,
          price: product.Price,
          images: product.Images.map((image) => image.url),
          category: {
            documentId: product.Category?.documentId,
            Name: product.Category?.Name,
          },
          stock: product.Stock,
        })),
        popular: filteredPopularProducts.map((product) => ({
          id: product.id,
          documentId: product.documentId,
          name: product.Name,
          description: product.Description,
          price: product.Price,
          images: product.Images.map((image) => image.url),
          category: {
            documentId: product.Category?.documentId,
            Name: product.Category?.Name,
          },
          stock: product.Stock,
          viewCount: product.views?.length || 0,
        })),
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
};
