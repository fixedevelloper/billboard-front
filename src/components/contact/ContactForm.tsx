"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTACT_EMAIL = "contact@guenspub.com";

export function ContactForm() {
  const t = useTranslations("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Pas d'endpoint backend pour un formulaire de contact : on ouvre le client mail de
  // l'utilisateur avec le message pré-rempli plutôt que de simuler un envoi qui n'existe pas.
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const body = `${message}\n\n— ${name}${email ? ` (${email})` : ""}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label={t("nameLabel")}
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Input
          type="email"
          label={t("emailFieldLabel")}
          placeholder={t("emailFieldPlaceholder")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <Input
        label={t("subjectLabel")}
        placeholder={t("subjectPlaceholder")}
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        required
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">{t("messageLabel")}</Label>
        <Textarea
          id="contact-message"
          placeholder={t("messagePlaceholder")}
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
      </div>

      <Button type="submit" size="lg" className="gap-2 self-start px-8">
        <Send className="h-4 w-4" />
        <span>{t("submit")}</span>
      </Button>
    </form>
  );
}
