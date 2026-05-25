/**
 * Shared types for useUserPageHandlers tests.
 */

/** Mock query object with data and refetch */
export interface MockUsersQuery {
  data: {
    users: Array<{
      id?: string | null;
      username?: string | null;
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      enabled?: boolean | null;
      createdTimestamp?: number | string | null;
      roles?: string[];
      tenantId?: string | null;
    }> | null;
  };
}

/** Delete user state */
export interface DeleteUserState {
  setDeletingUserId: jest.Mock;
}

/** Toggle user enabled state */
export interface ToggleUserState {
  setTogglingUserId: jest.Mock;
}

/** Password submit state */
export interface PasswordSubmitState {
  passwordResetUserId: string | null;
  newPassword: string;
  closeModal: jest.Mock;
}

/** Create user callbacks */
export interface CreateUserCallbacks {
  onSuccess: jest.Mock;
}
