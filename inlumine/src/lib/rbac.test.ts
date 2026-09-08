import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Role } from "@prisma/client";
import { hasPermission, isAdmin } from "./rbac";

describe("hasPermission", () => {
  it("allows only SUPER_ADMIN to manage users", () => {
    assert.equal(hasPermission(Role.SUPER_ADMIN, "manageUsers"), true);
    assert.equal(hasPermission(Role.SYSTEM_USER, "manageUsers"), false);
    assert.equal(hasPermission(Role.COLLEGE_MATE, "manageUsers"), false);
    assert.equal(hasPermission(Role.STUDENT, "manageUsers"), false);
  });

  it("keeps students off the social feed", () => {
    assert.equal(hasPermission(Role.STUDENT, "socialFeed"), false);
    assert.equal(hasPermission(Role.COLLEGE_MATE, "socialFeed"), true);
  });
});

describe("isAdmin", () => {
  it("treats system operators as admins and students as not", () => {
    assert.equal(isAdmin(Role.SUPER_ADMIN), true);
    assert.equal(isAdmin(Role.SYSTEM_USER), true);
    assert.equal(isAdmin(Role.STUDENT), false);
  });
});
