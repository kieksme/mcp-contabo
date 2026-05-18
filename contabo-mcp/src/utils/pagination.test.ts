import { describe, expect, it } from "vitest";
import { mergeQuery, paginationQuery } from "./pagination.js";

describe("paginationQuery", () => {
  it("maps pagination fields to query strings", () => {
    expect(
      paginationQuery({ page: 2, size: 10, orderBy: "name", order: "asc" }),
    ).toEqual({
      page: "2",
      size: "10",
      orderBy: "name",
      order: "asc",
    });
  });

  it("omits undefined fields", () => {
    expect(paginationQuery({})).toEqual({});
  });
});

describe("mergeQuery", () => {
  it("merges pagination and extra filters", () => {
    expect(
      mergeQuery({ page: 1 }, { status: "running", empty: "", skip: null }),
    ).toEqual({
      page: "1",
      status: "running",
    });
  });
});
