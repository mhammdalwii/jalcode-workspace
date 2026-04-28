import * as z from "zod";

// ==========================================
// SCHEMA KLIEN
// ==========================================
export const clientSchema = z.object({
  company: z.string().min(3, { message: "Nama perusahaan minimal 3 karakter" }),
  name: z.string().min(3, { message: "Nama PIC minimal 3 karakter" }),
  email: z.union([z.literal(""), z.string().email({ message: "Format email tidak valid" })]).optional(),
  phone: z
    .union([
      z.literal(""),
      z
        .string()
        .regex(/^[0-9+ \-]+$/, { message: "Hanya boleh berisi angka, spasi, +, atau -" })
        .min(9, { message: "Nomor telepon minimal 9 digit" })
        .max(15, { message: "Nomor telepon maksimal 15 digit" }),
    ])
    .optional(),
  address: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

// ==========================================
//  SCHEMA PROYEK
// ==========================================
export const projectSchema = z.object({
  title: z.string().min(3, { message: "Nama proyek minimal 3 karakter" }),
  client_id: z.string().optional(),
  category: z.string().min(1, { message: "Kategori wajib dipilih" }),
  status: z.string().min(1, { message: "Status wajib dipilih" }),
  team_member_ids: z.array(z.number()).min(1, "Pilih minimal 1 PIC untuk proyek ini"),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const menteeSchema = z.object({
  name: z.string().min(3, { message: "Nama peserta minimal 3 karakter" }),
  email: z.union([z.literal(""), z.string().email({ message: "Format email tidak valid" })]).optional(),
  program: z.string().min(1, { message: "Program studi wajib dipilih" }),
  status: z.string().min(1, { message: "Status wajib dipilih" }),
  mentor_id: z.string().refine((val) => val !== "" && val !== "0", {
    message: "Mentor pembimbing wajib dipilih",
  }),
});

export type MenteeFormValues = z.infer<typeof menteeSchema>;
