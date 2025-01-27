/**
 * A set of functions called "actions" for `list-users`
 */

export default {
  getUsers: async (ctx) => {
    try {
      const { user } = ctx.state;
      const { user_role } = user;

      if (user_role !== "ADMIN") {
        ctx.status = 403;
        return (ctx.body = { error: "Unauthorized" });
      }

      const users = await strapi
        .documents("plugin::users-permissions.user")
        .findMany({
          fields: ["id", "display_name", "email", "user_role", "username"],
        });

      ctx.body = users;
    } catch (err) {
      ctx.body = err;
    }
  },
  deleteUser: async (ctx) => {
    try {
      const { user } = ctx.state;
      const { user_role, documentId } = user;

      if (user_role !== "ADMIN") {
        ctx.status = 403;
        return (ctx.body = { error: "Unauthorized" });
      }

      const { id } = ctx.params;
      const stored_user = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: id,
        });
      if (!stored_user) {
        ctx.status = 404;
        return (ctx.body = { error: "User not found" });
      }

      await strapi
        .documents("plugin::users-permissions.user")
        .delete({ documentId: id });

      ctx.body = { message: "User deleted" };
    } catch (error) {
      ctx.body = error;
    }
  },
  editUser: async (ctx) => {
    try {
      const { user } = ctx.state;
      const { user_role } = user;
      const { data } = ctx.request.body;
      const { id } = ctx.params;

      if (user_role !== "ADMIN") {
        ctx.status = 403;
        return (ctx.body = { error: "Unauthorized" });
      }
      const stored_user = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: id,
        });
      if (!stored_user) {
        ctx.status = 404;
        return (ctx.body = { error: "User not found" });
      }

      await strapi.documents("plugin::users-permissions.user").update({
        documentId: stored_user.documentId,
        data,
        status: "published",
      });
      ctx.body = { message: "User updated" };
    } catch (error) {
      ctx.body = error;
    }
  },
};
