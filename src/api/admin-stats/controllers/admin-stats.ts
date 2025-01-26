/**
 * A set of functions called "actions" for `admin-stats`
 */

export default {
  getStats: async (ctx) => {
    try {
      const { user } = ctx.state;
      const { user_role } = user;

      if (user_role !== "ADMIN") {
        ctx.status = 403;
        return (ctx.body = { error: "Unauthorized" });
      }
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const orders = await strapi.documents("api::order.order").findMany({
        filters: {
          createdAt: {
            $gte: lastMonth,
          },
        },
        populate: {
          user: {
            fields: ["display_name", "email"],
          },
        },
        fields: ["id", "TotalPrice", "createdAt"],
      });
      const users = await strapi
        .documents("plugin::users-permissions.user")
        .findMany({
          filters: {
            createdAt: {
              $gte: lastMonth,
            },
          },
        });
      const monthNames = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      const datosMensuales = monthNames.reduce((acc, month) => {
        acc[month] = 0;
        return acc;
      }, {});
      orders.forEach((order) => {
        const fecha = new Date(order.createdAt);
        const month = fecha.getMonth();
        if (month >= 0 && month < 12) {
          datosMensuales[monthNames[month]] += order.TotalPrice;
        }
      });
      const total = orders.reduce((acc, order) => acc + order.TotalPrice, 0);
      const ventas = orders.reduce((acc, _) => acc + 1, 0);
      const nuevosUsuarios = users.reduce((acc, _) => acc + 1, 0);
      ctx.body = {
        cards: [
          { title: "Ingresos totales", value: total, type: "Ingresos" },
          { title: "Ventas", value: ventas, type: "Ventas" },
          { title: "Nuevos clientes", value: nuevosUsuarios, type: "Clientes" },
        ],
        ventasRecientes: orders.slice(0, 5),
        datosMensuales,
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
