CREATE TABLE "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"otp" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_email" ON "password_reset_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_otp" ON "password_reset_tokens" USING btree ("otp");