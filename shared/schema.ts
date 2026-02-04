import { pgTable, uuid, varchar, text, timestamp, integer, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  nomeCompleto: varchar("nome_completo", { length: 255 }).notNull(),
  nomeUsuario: varchar("nome_usuario", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senhaHash: varchar("senha_hash", { length: 255 }).notNull(),
  tipoConta: varchar("tipo_conta", { length: 50 }).notNull(),
  pais: varchar("pais", { length: 100 }).notNull().default("Brasil"),
  estado: varchar("estado", { length: 100 }).notNull(),
  instituicaoEnsino: varchar("instituicao_ensino", { length: 255 }).notNull(),
  imagemAvatar: text("imagem_avatar"),
  powersCarteira: integer("powers_carteira").notNull().default(300),
  starsCarteira: integer("stars_carteira").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const atividades = pgTable("atividades", {
  id: varchar("id", { length: 255 }).primaryKey(),
  idUser: uuid("id_user").notNull(),
  tipo: varchar("tipo", { length: 255 }).notNull(),
  idJson: text("id_json").notNull(),
  stars: integer("stars").default(100),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const visitantesAtividades = pgTable("visitantes_atividades", {
  id: serial("id").primaryKey(),
  codigoAtividade: varchar("codigo_atividade", { length: 255 }).notNull(),
  idUsuarioVisitante: uuid("id_usuario_visitante"),
  nomeVisitante: varchar("nome_visitante", { length: 255 }),
  emailVisitante: varchar("email_visitante", { length: 255 }),
  tipoVisitante: varchar("tipo_visitante", { length: 50 }).default("anonimo"),
  dataAcesso: timestamp("data_acesso").defaultNow(),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Usuario = typeof usuarios.$inferSelect;
export type InsertUsuario = typeof usuarios.$inferInsert;
export type Atividade = typeof atividades.$inferSelect;
export type InsertAtividade = typeof atividades.$inferInsert;
export type VisitanteAtividade = typeof visitantesAtividades.$inferSelect;
export type InsertVisitanteAtividade = typeof visitantesAtividades.$inferInsert;
