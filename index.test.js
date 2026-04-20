const request = require("supertest");
const app = require("./index");

describe("Basic API Test", () => {
  it("should return status 200 on homepage", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});
