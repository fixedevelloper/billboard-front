"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_KEYS = [1, 2, 3, 4, 5, 6, 7];

export function FaqAccordion() {
  const t = useTranslations("faq");
  const [openKey, setOpenKey] = useState<number | null>(1);

  return (
    <div className="flex flex-col gap-3">
      {FAQ_KEYS.map((key) => {
        const isOpen = openKey === key;
        return (
          <div
            key={key}
            className={cn(
              "overflow-hidden rounded-2xl border transition-colors",
              isOpen ? "border-primary/40 bg-muted/30" : "border-border/60"
            )}
          >
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : key)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-foreground sm:text-base">{t(`q${key}`)}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                  isOpen && "rotate-180 text-primary"
                )}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{t(`a${key}`)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
