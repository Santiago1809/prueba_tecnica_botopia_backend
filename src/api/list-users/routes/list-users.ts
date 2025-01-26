export default {
  routes: [
    {
      method: "GET",
      path: "/list-users",
      handler: "list-users.getUsers",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/list-users/:id",
      handler: "list-users.deleteUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/list-users/:id",
      handler: "list-users.editUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
