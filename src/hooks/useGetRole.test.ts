import { useGetRole } from "./useGetRole";
import { KeycloakRoles } from "../auth/keycloakTypes";

const mockUseSelector = jest.fn();

interface MockState { auth: { userInfo: { roles: KeycloakRoles[] } | null } }

jest.mock("react-redux", () => ({
  useSelector: (selector: (state: MockState) => unknown) => mockUseSelector(selector),
}));

describe("useGetRole", () => {
  afterEach(() => {
    mockUseSelector.mockReset();
  });

  it("returns false when userInfo is missing", () => {
    mockUseSelector.mockImplementation((selector: (state: MockState) => unknown) =>
      selector({ auth: { userInfo: null } })
    );
    expect(useGetRole()).toEqual({ isAdmin: false, isSuperAdmin: false, isUser: false });
  });

  it("detects roles correctly", () => {
    mockUseSelector.mockImplementation((selector: (state: MockState) => unknown) =>
      selector({
        auth: { userInfo: { roles: [KeycloakRoles.Admin, KeycloakRoles.User] } },
      })
    );

    expect(useGetRole()).toEqual({ isAdmin: true, isSuperAdmin: false, isUser: true });
  });
});
