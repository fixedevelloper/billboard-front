"use client";

import { useEffect, useState, FormEvent } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile, updateUserProfile, changePassword, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  LogOut,
  Megaphone,
  Building2,
  ShoppingBag,
  ChevronRight,
  Loader2,
  AlertCircle,
  PlusCircle,
  Sparkles,
  Pencil,
  KeyRound,
  Check,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("auth.profile");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { userId, advertiserId, ownerId, mediaBuyerId, isAuthenticated, hydrated, logout } = useAuth();

  // Mode Édition du profil
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", phoneNumber: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Mode Changement de mot de passe
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  const { data: profile, error, isLoading, mutate } = useSWR(
      userId ? ["profile", userId] : null,
      ([, id]) => getUserProfile(id),
      {
        onSuccess: (data) => {
          setEditForm({
            fullName: data.fullName || "",
            phoneNumber: data.phoneNumber || "",
          });
        },
      }
  );

  if (!hydrated || !isAuthenticated) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 px-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
  };

  // Soumission de la modification du profil
  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSavingProfile(true);
    setProfileError(null);
    try {
      await updateUserProfile(userId, editForm);
      await mutate();
      setIsEditing(false);
    } catch (err) {
      setProfileError(extractErrorMessage(err, t("updateError", { defaultValue: "Erreur lors de la mise à jour." })));
    } finally {
      setSavingProfile(false);
    }
  }

  // Soumission du changement de mot de passe
  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t("passwordsDoNotMatch", { defaultValue: "Les mots de passe ne correspondent pas." }));
      return;
    }

    if (!userId) {
      setPasswordError(t("passwordError", { defaultValue: "Échec du changement de mot de passe." }));
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(userId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
    } catch (err) {
      setPasswordError(extractErrorMessage(err, t("passwordError", { defaultValue: "Échec du changement de mot de passe." })));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16">
        <Card className="shadow-xl border-border/60 overflow-hidden">
          {/* Banner visuel d'en-tête */}
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
            <div className="absolute -bottom-8 left-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold shadow-lg ring-4 ring-background">
                {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    getInitials(profile?.fullName)
                )}
              </div>
            </div>
          </div>

          <CardHeader className="pt-12 pb-4 px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {profile?.fullName || t("title")}
                </CardTitle>
                <CardDescription className="text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{profile?.email || tCommon("loading")}</span>
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {profile?.status && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{profile.status}</span>
                </span>
                )}

                {!isEditing && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="gap-1.5 shadow-sm"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>{t("edit", { defaultValue: "Éditer" })}</span>
                    </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pb-6">
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{t("loadError")}</span>
                </div>
            )}

            {isLoading && !error && (
                <div className="space-y-3 py-2 animate-pulse">
                  <div className="h-10 bg-muted rounded-lg w-full" />
                  <div className="h-10 bg-muted rounded-lg w-full" />
                </div>
            )}

            {/* Formulaire d'édition du profil */}
            {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Pencil className="h-4 w-4 text-primary" />
                      {t("editProfileTitle", { defaultValue: "Modifier mes informations" })}
                    </h4>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setIsEditing(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <Input
                      label={t("fullName")}
                      value={editForm.fullName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                      required
                  />

                  <Input
                      label={t("phone")}
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  />

                  {profileError && (
                      <p className="text-xs font-medium text-destructive">{profileError}</p>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      {tCommon("cancel", { defaultValue: "Annuler" })}
                    </Button>
                    <Button type="submit" size="sm" loading={savingProfile} disabled={savingProfile}>
                      {tCommon("save", { defaultValue: "Enregistrer" })}
                    </Button>
                  </div>
                </form>
            ) : (
                /* Affichage Standard du profil */
                profile &&
                !isLoading && (
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center justify-between text-sm py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("fullName")}
                  </span>
                        <span className="font-semibold text-foreground">{profile.fullName}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t("email")}
                  </span>
                        <span className="font-semibold text-foreground">{profile.email}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {t("phone")}
                  </span>
                        <span className="font-semibold text-foreground">
                    {profile.phoneNumber ?? t("notProvided")}
                  </span>
                      </div>
                    </div>
                )
            )}

            {/* Section Sécurité : Changement de mot de passe */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                  <span>{t("securitySection", { defaultValue: "Sécurité du compte" })}</span>
                </h4>
                {!isChangingPassword && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-primary hover:text-primary"
                        onClick={() => setIsChangingPassword(true)}
                    >
                      {t("changePasswordBtn", { defaultValue: "Changer le mot de passe" })}
                    </Button>
                )}
              </div>

              {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>{t("passwordSuccess", { defaultValue: "Mot de passe modifié avec succès !" })}</span>
                  </div>
              )}

              {isChangingPassword && (
                  <form onSubmit={handleChangePassword} className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between pb-1">
                      <h5 className="text-xs font-semibold">{t("changePasswordTitle", { defaultValue: "Nouveau mot de passe" })}</h5>
                      <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => setIsChangingPassword(false)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <PasswordInput
                        label={t("currentPassword", { defaultValue: "Mot de passe actuel" })}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        required
                    />
                    <PasswordInput
                        label={t("newPassword", { defaultValue: "Nouveau mot de passe" })}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                        required
                    />
                    <PasswordInput
                        label={t("confirmPassword", { defaultValue: "Confirmer le mot de passe" })}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                    />

                    {passwordError && (
                        <p className="text-xs font-medium text-destructive">{passwordError}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsChangingPassword(false)}>
                        {tCommon("cancel", { defaultValue: "Annuler" })}
                      </Button>
                      <Button type="submit" size="sm" loading={savingPassword} disabled={savingPassword}>
                        {t("updatePassword", { defaultValue: "Mettre à jour" })}
                      </Button>
                    </div>
                  </form>
              )}
            </div>

            {/* Section Rôles & Accès Rapides */}
            <div className="space-y-3 pt-2 border-t border-border/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>{t("rolesSectionTitle", { defaultValue: "Mes Espaces & Profils" })}</span>
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                <Button
                    asChild
                    variant={advertiserId ? "outline" : "secondary"}
                    className="w-full justify-between h-auto py-3 px-4 shadow-sm group hover:border-primary/50 transition-all"
                >
                  <Link href={advertiserId ? "/dashboard" : "/become-advertiser"}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <Megaphone className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">
                          {advertiserId ? t("advertiserProfile") : t("becomeAdvertiser")}
                        </p>
                        <p className="text-xs text-muted-foreground font-normal">
                          {advertiserId
                              ? t("advertiserActive", { defaultValue: "Gérer mes campagnes" })
                              : t("advertiserJoin", { defaultValue: "Créer un profil annonceur" })}
                        </p>
                      </div>
                    </div>
                    {advertiserId ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    ) : (
                        <PlusCircle className="h-4 w-4 text-primary" />
                    )}
                  </Link>
                </Button>

                <Button
                    asChild
                    variant="outline"
                    className="w-full justify-between h-auto py-3 px-4 shadow-sm group hover:border-primary/50 transition-all"
                >
                  <Link href={ownerId ? "/owner-dashboard" : "/become-owner"}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{t("ownerProfile")}</p>
                        <p className="text-xs text-muted-foreground font-normal">
                          {t("ownerDesc", { defaultValue: "Gérer mes panneaux publicitaires" })}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button
                    asChild
                    variant={mediaBuyerId ? "outline" : "secondary"}
                    className="w-full justify-between h-auto py-3 px-4 shadow-sm group hover:border-primary/50 transition-all"
                >
                  <Link href={mediaBuyerId ? "/media-buyer" : "/become-mediabuyer"}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">
                          {mediaBuyerId ? t("mediaBuyerProfile") : t("becomeMediaBuyer")}
                        </p>
                        <p className="text-xs text-muted-foreground font-normal">
                          {mediaBuyerId ? t("mediaBuyerActive") : t("mediaBuyerJoin")}
                        </p>
                      </div>
                    </div>
                    {mediaBuyerId ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    ) : (
                        <PlusCircle className="h-4 w-4 text-primary" />
                    )}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Déconnexion */}
            <div className="pt-4 border-t border-border/60">
              <Button
                  variant="destructive"
                  className="w-full justify-center gap-2 font-semibold shadow-sm"
                  onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span>{t("logout")}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}