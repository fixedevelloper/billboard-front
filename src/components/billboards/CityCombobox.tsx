"use client";

import { useState } from "react";
import useSWR from "swr";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CityResponse, getCities } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CityComboboxProps {
  value: string;
  onSelect: (city: CityResponse) => void;
  placeholder?: string;
  emptyLabel?: string;
  searchLabel?: string;
  disabled?: boolean;
}

export function CityCombobox({
  value,
  onSelect,
  placeholder = "Sélectionner une ville…",
  emptyLabel = "Aucune ville trouvée.",
  searchLabel = "Rechercher une ville…",
  disabled,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: cities, isLoading } = useSWR(open ? ["cities", query] : null, ([, q]) => getCities(q));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn("flex items-center gap-2 truncate", !value && "text-muted-foreground")}>
            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" />
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchLabel} value={query} onValueChange={setQuery} />
          <CommandList>
            {!isLoading && (!cities || cities.length === 0) && <CommandEmpty>{emptyLabel}</CommandEmpty>}
            <CommandGroup>
              {cities?.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.id}
                  onSelect={() => {
                    onSelect(city);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === city.name ? "opacity-100" : "opacity-0")} />
                  <span>{city.name}</span>
                  {city.country && <span className="ml-1.5 text-xs text-muted-foreground">· {city.country}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
