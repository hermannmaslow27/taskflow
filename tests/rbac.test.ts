import { describe, it, expect } from "vitest";
import { hasPermission, ROLE_HIERARCHY, type ProjectRole } from "../src/lib/rbac";

describe("RBAC Permissions Hierarchy", () => {
  it("verifies owner has full permissions", () => {
    expect(hasPermission("owner", "owner")).toBe(true);
    expect(hasPermission("owner", "editor")).toBe(true);
    expect(hasPermission("owner", "viewer")).toBe(true);
  });

  it("verifies editor permissions", () => {
    expect(hasPermission("editor", "owner")).toBe(false);
    expect(hasPermission("editor", "editor")).toBe(true);
    expect(hasPermission("editor", "viewer")).toBe(true);
  });

  it("verifies viewer permissions", () => {
    expect(hasPermission("viewer", "owner")).toBe(false);
    expect(hasPermission("viewer", "editor")).toBe(false);
    expect(hasPermission("viewer", "viewer")).toBe(true);
  });
});
