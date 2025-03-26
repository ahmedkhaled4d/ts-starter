import { greeting } from "../index";

describe("Greeting Function", () => {
  it("should return a greeting with the given name", () => {
    expect(greeting("World")).toBe("Hello, World!");
  });
});
