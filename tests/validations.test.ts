import { describe, it, expect } from "vitest";
import { createTaskSchema } from "../src/lib/validations/task";
import { loginSchema, registerSchema } from "../src/lib/validations/auth";

describe("Zod Validation Schemas", () => {
  it("validates valid task creation payload", () => {
    const res = createTaskSchema.safeParse({
      projectId: "proj-123",
      title: "Créer l'architecture offline",
      priority: "urgent",
      status: "in_progress",
    });
    expect(res.success).toBe(true);
  });

  it("fails task creation when title is empty", () => {
    const res = createTaskSchema.safeParse({
      projectId: "proj-123",
      title: "",
    });
    expect(res.success).toBe(false);
  });

  it("validates email formatting in login", () => {
    const valid = loginSchema.safeParse({
      email: "alex@example.com",
      password: "password123",
    });
    expect(valid.success).toBe(true);

    const invalid = loginSchema.safeParse({
      email: "not-an-email",
      password: "123",
    });
    expect(invalid.success).toBe(false);
  });
});
