describe("http/methods", () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("get calls deffHttp.get with built config and options", async () => {
    const mockGet = jest.fn(async () => ({ ok: true }));
    jest.doMock("../../axios", () => ({ deffHttp: { get: mockGet, post: jest.fn(), put: jest.fn(), delete: jest.fn() } }));
    jest.doMock("../../../config/environment", () => ({ __esModule: true, default: { API_URL: "http://api" } }));

     
    const { get } = require("./methods");

    await get("/users/{id1}", { q: 1 }, { withToken: true, withCredentials: true, urlIds: ["123"], baseURL: "http://api" });
    expect(mockGet).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/users/123", baseURL: "http://api", withCredentials: true }),
      expect.objectContaining({ withToken: true, withCredentials: true })
    );
  });

  it("postForm calls deffHttp.post with multipart header", async () => {
    const mockPost = jest.fn(async () => ({ ok: true }));
    jest.doMock("../../axios", () => ({ deffHttp: { get: jest.fn(), post: mockPost, put: jest.fn(), delete: jest.fn() } }));
    jest.doMock("../../../config/environment", () => ({ __esModule: true, default: { API_URL: "http://api" } }));


    const { postForm } = require("./methods");
    const fd = new FormData();
    await postForm("/upload", fd);
    expect(mockPost).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/upload",
        headers: expect.objectContaining({ "Content-Type": "multipart/form-data" }),
      }),
      expect.any(Object)
    );
  });

  it("post calls deffHttp.post with built URL and payload", async () => {
    const mockPost = jest.fn(async () => ({ ok: true }));
    jest.doMock("../../axios", () => ({ deffHttp: { get: jest.fn(), post: mockPost, put: jest.fn(), delete: jest.fn() } }));
    jest.doMock("../../../config/environment", () => ({ __esModule: true, default: { API_URL: "http://api" } }));


    const { post } = require("./methods");
    await post("/users/{id1}", { a: 1 }, { withToken: true, withCredentials: true, urlIds: ["123"], baseURL: "http://api" });

    expect(mockPost).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/users/123", baseURL: "http://api", data: expect.objectContaining({ a: 1 }) }),
      expect.objectContaining({ withToken: true, withCredentials: true })
    );
  });

  it("put calls deffHttp.put with built URL and payload", async () => {
    const mockPut = jest.fn(async () => ({ ok: true }));
    jest.doMock("../../axios", () => ({ deffHttp: { get: jest.fn(), post: jest.fn(), put: mockPut, delete: jest.fn() } }));
    jest.doMock("../../../config/environment", () => ({ __esModule: true, default: { API_URL: "http://api" } }));

     
    const { put } = require("./methods");
    await put("/users/{id1}", { a: 2 }, { withToken: true, withCredentials: true, urlIds: ["123"], baseURL: "http://api" });

    expect(mockPut).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/users/123", baseURL: "http://api", data: expect.objectContaining({ a: 2 }) }),
      expect.objectContaining({ withToken: true, withCredentials: true })
    );
  });

  it("deleteMethod calls deffHttp.delete with built URL and payload", async () => {
    const mockDelete = jest.fn(async () => ({ ok: true }));
    jest.doMock("../../axios", () => ({ deffHttp: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: mockDelete } }));
    jest.doMock("../../../config/environment", () => ({ __esModule: true, default: { API_URL: "http://api" } }));

     
    const { deleteMethod } = require("./methods");
    await deleteMethod("/users/{id1}", { a: 3 }, { withToken: true, withCredentials: true, urlIds: ["123"], baseURL: "http://api" });

    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/users/123", baseURL: "http://api", data: expect.objectContaining({ a: 3 }) }),
      expect.objectContaining({ withToken: true, withCredentials: true })
    );
  });
});
