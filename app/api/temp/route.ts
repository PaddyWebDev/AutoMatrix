import prisma from "@/lib/db";
import { Category } from "@prisma/client";

export async function POST() {
  await prisma.inventory.createMany({
    data: [
      { name: "Oil Filter", sku: "SKU-001", brand: "Bosch", category: Category.ENGINE_PARTS, unitPrice: 450, quantity: 45, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Air Filter", sku: "SKU-002", brand: "Mahle", category: Category.ENGINE_PARTS, unitPrice: 650, quantity: 38, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Engine Oil 5W30", sku: "SKU-003", brand: "Castrol", category: Category.FLUIDS, unitPrice: 1200, quantity: 10, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Spark Plug", sku: "SKU-004", brand: "NGK", category: Category.ENGINE_PARTS, unitPrice: 350, quantity: 86, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Brake Pad Front", sku: "SKU-005", brand: "Brembo", category: Category.BRAKE_SYSTEM, unitPrice: 1800, quantity: 44, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Brake Pad Rear", sku: "SKU-006", brand: "Brembo", category: Category.BRAKE_SYSTEM, unitPrice: 1600, quantity: 33, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Battery 35Ah", sku: "SKU-007", brand: "Exide", category: Category.ELECTRICAL, unitPrice: 4500, quantity: 2, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Headlight Bulb H4", sku: "SKU-008", brand: "Philips", category: Category.ELECTRICAL, unitPrice: 300, quantity: 220, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Coolant", sku: "SKU-009", brand: "Motul", category: Category.FLUIDS, unitPrice: 900, quantity: 7, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Fuel Pump", sku: "SKU-010", brand: "Bosch", category: Category.ENGINE_PARTS, unitPrice: 5500, quantity: 32, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },

      { name: "Wiper Blades 18\"", sku: "SKU-011", brand: "3M", category: Category.BODY_PARTS, unitPrice: 550, quantity: 80, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Wiper Motor", sku: "SKU-012", brand: "Denso", category: Category.ELECTRICAL, unitPrice: 3200, quantity: 16, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Alternator", sku: "SKU-013", brand: "Valeo", category: Category.ELECTRICAL, unitPrice: 6800, quantity: 18, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Radiator Hose", sku: "SKU-014", brand: "Gates", category: Category.ENGINE_PARTS, unitPrice: 900, quantity: 14, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Timing Belt", sku: "SKU-015", brand: "Gates", category: Category.ENGINE_PARTS, unitPrice: 2400, quantity: 55, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },

      { name: "Cabin Filter", sku: "SKU-016", brand: "Mahle", category: Category.MISC, unitPrice: 500, quantity: 103, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Clutch Plate", sku: "SKU-017", brand: "Luk", category: Category.ENGINE_PARTS, unitPrice: 3500, quantity: 67  , serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Horn Set", sku: "SKU-018", brand: "Hella", category: Category.ELECTRICAL, unitPrice: 950, quantity: 35, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Engine Mount", sku: "SKU-019", brand: "Febi", category: Category.ENGINE_PARTS, unitPrice: 2750, quantity: 23, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Starter Motor", sku: "SKU-020", brand: "Bosch", category: Category.ELECTRICAL, unitPrice: 5200, quantity: 15, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },

      { name: "Wheel Bearing", sku: "SKU-022", brand: "SKF", category: Category.SUSPENSION, unitPrice: 1300, quantity: 345, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Transmission Oil", sku: "SKU-023", brand: "Mobil", category: Category.FLUIDS, unitPrice: 950, quantity: 60, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Fuse Set", sku: "SKU-024", brand: "Bosch", category: Category.ELECTRICAL, unitPrice: 120, quantity: 50, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
      { name: "Ignition Coil", sku: "SKU-025", brand: "NGK", category: Category.ELECTRICAL, unitPrice: 2100, quantity: 73, serviceCenterId: "cmj3waeek0000uu58r41l4kgf" },
    ],
  });

  return Response.json({ ok: true });
}
