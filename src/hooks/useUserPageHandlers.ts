/**
 * User page handler hooks for CRUD operations.
 * Re-exports from split modules for backwards compatibility.
 */
export {
  useUserQueries,
  useUsersList,
  useCreateUser,
  useDeleteUser,
  useToggleUserEnabled,
  usePasswordSubmit,
} from './userHandlers';
