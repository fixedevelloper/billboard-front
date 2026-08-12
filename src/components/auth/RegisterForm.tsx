"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  extractErrorMessage,
  registerAdvertiser,
  registerMediaBuyer,
  registerOwner,
  registerUser,
} from "@/lib/api";

type ProfileType = "advertiser" | "owner" | "mediabuyer";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const tCommon = useTranslations("common");

  const [profileType, setProfileType] = useState<ProfileType>("advertiser");

  const [account, setAccount] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const [profile, setProfile] = useState({
    companyName: "",
    taxNumber: "",
    taxId: "",
    contactEmail: "",
    contactPhone: "",
    registrationNumber: "",
    revenueShareRate: "0.15",
    creditLimit: "10000",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateAccount(field: keyof typeof account) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
        setAccount((prev) => ({ ...prev, [field]: event.target.value }));
  }

  function updateProfile(field: keyof typeof profile) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
        setProfile((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await registerUser({
        email: account.email,
        password: account.password,
        firstName: account.firstName,
        lastName: account.lastName,
        phoneNumber: account.phoneNumber || undefined,
      });

      if (profileType === "advertiser") {
        await registerAdvertiser({
          userId: user.id,
          companyName: profile.companyName,
          taxNumber: profile.taxNumber,
          contactEmail: profile.contactEmail,
          contactPhone: profile.contactPhone,
        });
      } else if (profileType === "owner") {
        await registerOwner({
          userId: user.id,
          companyName: profile.companyName,
          registrationNumber: profile.registrationNumber || undefined,
          contactEmail: profile.contactEmail,
          phoneNumber: profile.contactPhone || undefined,
          revenueShareRate: profile.revenueShareRate,
        });
      } else {
        await registerMediaBuyer({
          userId: user.id,
          companyName: profile.companyName,
          taxId: profile.taxId || undefined,
          contactEmail: profile.contactEmail,
          phoneNumber: profile.contactPhone || undefined,
          creditLimit: profile.creditLimit,
        });
      }

      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err, t("title")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl border-border/60">
        <CardHeader className="space-y-1 text-center sm:text-left pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">{t("title")}</CardTitle>
          <CardDescription className="text-muted-foreground">{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base font-medium text-foreground">{t("success")}</p>
                <Button asChild className="w-full sm:w-auto mt-2">
                  <Link href={`/verify-email?email=${encodeURIComponent(account.email)}`}>
                    {t("goToVerifyEmail")}
                  </Link>
                </Button>
              </div>
          ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Type de Profil - Tab Group */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold leading-none text-foreground">
                    {t("profileType")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-muted rounded-xl">
                    {(["advertiser", "owner", "mediabuyer"] as ProfileType[]).map((type) => (
                        <Button
                            key={type}
                            type="button"
                            size="sm"
                            variant={profileType === type ? "default" : "ghost"}
                            className={`w-full transition-all duration-200 ${
                                profileType === type
                                    ? "shadow-sm font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            }`}
                            onClick={() => setProfileType(type)}
                        >
                          {t(type === "advertiser" ? "profileAdvertiser" : type === "owner" ? "profileOwner" : "profileMediaBuyer")}
                        </Button>
                    ))}
                  </div>
                </div>

                {/* Section Informations Personnelles */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        name="firstName"
                        label={t("firstName")}
                        value={account.firstName}
                        onChange={updateAccount("firstName")}
                        required
                    />
                    <Input
                        name="lastName"
                        label={t("lastName")}
                        value={account.lastName}
                        onChange={updateAccount("lastName")}
                        required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        name="email"
                        type="email"
                        label={tCommon("email")}
                        value={account.email}
                        onChange={updateAccount("email")}
                        required
                    />
                    <Input
                        name="phoneNumber"
                        type="tel"
                        label={t("phone")}
                        value={account.phoneNumber}
                        onChange={updateAccount("phoneNumber")}
                    />
                  </div>

                  <PasswordInput
                      name="password"
                      label={tCommon("password")}
                      value={account.password}
                      onChange={updateAccount("password")}
                      required
                  />
                </div>

                {/* Section Détails du Profil */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold leading-none text-foreground">
                    {t("profileDetails")}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        name="companyName"
                        label={t("companyName")}
                        value={profile.companyName}
                        onChange={updateProfile("companyName")}
                        required
                    />
                    <Input
                        name="contactEmail"
                        type="email"
                        label={t("contactEmail")}
                        value={profile.contactEmail}
                        onChange={updateProfile("contactEmail")}
                        required
                    />
                  </div>

                  <Input
                      name="contactPhone"
                      type="tel"
                      label={t("contactPhone")}
                      value={profile.contactPhone}
                      onChange={updateProfile("contactPhone")}
                  />

                  {/* Champs conditionnels selon le type de profil */}
                  {profileType === "advertiser" && (
                      <Input
                          name="taxNumber"
                          label={t("taxNumber")}
                          value={profile.taxNumber}
                          onChange={updateProfile("taxNumber")}
                          required
                      />
                  )}

                  {profileType === "owner" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            name="registrationNumber"
                            label={t("registrationNumber")}
                            value={profile.registrationNumber}
                            onChange={updateProfile("registrationNumber")}
                        />
                        <Input
                            name="revenueShareRate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            label={t("revenueShareRate")}
                            value={profile.revenueShareRate}
                            onChange={updateProfile("revenueShareRate")}
                            required
                        />
                      </div>
                  )}

                  {profileType === "mediabuyer" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            name="taxId"
                            label={t("taxId")}
                            value={profile.taxId}
                            onChange={updateProfile("taxId")}
                        />
                        <Input
                            name="creditLimit"
                            type="number"
                            step="0.01"
                            label={t("creditLimit")}
                            value={profile.creditLimit}
                            onChange={updateProfile("creditLimit")}
                            required
                        />
                      </div>
                  )}
                </div>

                {/* Gestion des erreurs */}
                {error && (
                    <div className="p-3 text-sm font-medium rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                      {error}
                    </div>
                )}

                {/* Actions & Navigation */}
                <div className="space-y-4 pt-2">
                  <Button type="submit" className="w-full" loading={submitting} disabled={submitting}>
                    {submitting ? t("submitting") : t("submit")}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {t("haveAccount")}{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-primary underline-offset-4 hover:underline transition-all"
                    >
                      {t("goToLogin")}
                    </Link>
                  </p>
                </div>
              </form>
          )}
        </CardContent>
      </Card>
  );
}