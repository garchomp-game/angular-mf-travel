import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const expenseRecords = sqliteTable("expense_records", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  travelDate: text("travel_date").notNull(),
  visitTo: text("visit_to").notNull(),
  routeText: text("route_text").notNull(),
  isRoundTrip: integer("is_round_trip", { mode: "boolean" })
    .notNull()
    .default(false),
  categoryCode: text("category_code").notNull().default(""),
  taxCode: text("tax_code").notNull().default(""),
  preApprovalNo: text("pre_approval_no"),
  memo: text("memo"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdateFn(() => new Date().toISOString()),
});
