import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.post("/api/bookings", async (req, res) => {
    try {
      const booking = insertBookingSchema.parse(req.body);
      const result = await storage.createBooking(booking);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  app.get("/api/bookings", async (_req, res) => {
    const bookings = await storage.getBookings();
    res.json(bookings);
  });

  app.get("/api/bookings/:date", async (req, res) => {
    const bookings = await storage.getBookingsByDate(req.params.date);
    res.json(bookings);
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const booking = await storage.updateBookingStatus(
        parseInt(req.params.id),
        status
      );
      res.json(booking);
    } catch (error) {
      res.status(404).json({ error: "Booking not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
