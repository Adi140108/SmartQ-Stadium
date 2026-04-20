const request = require("supertest");
const app = require("./index");

describe("Basic API Test", () => {

  // ✅ Test 1: Homepage
  it("should return status 200 on homepage", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  // ✅ Test 2: Firestore route
  it("should return 200 for test-db route", async () => {
    const res = await request(app).get("/test-db");
    expect(res.statusCode).toBe(200);
  });

});
