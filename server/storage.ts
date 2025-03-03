import { bookings, type Booking, type InsertBooking } from "@shared/schema";

export interface IStorage {
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
}

export class MemStorage implements IStorage {
  private bookings: Map<number, Booking>;
  private currentId: number;

  constructor() {
    this.bookings = new Map();
    this.currentId = 1;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      status: "pending",
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.date === date
    );
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error("Booking not found");
    }
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
}

export const storage = new MemStorage();
