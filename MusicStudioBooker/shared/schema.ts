import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  duration: integer("duration").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
});

export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, status: true })
  .extend({
    phoneNumber: z.string().min(10).max(13),
    duration: z.number().min(1).max(10),
  });

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
