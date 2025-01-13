"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { clientApiClient } from "@/services/apiClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
// shadcn/ui компоненты
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge"
import { parseISO, format } from 'date-fns';
import { ru, kk, enUS } from 'date-fns/locale';
import {createChangePasswordSchema} from "@/features/authentication/lib/zod"
import { z } from "zod";
import { useToast } from "@/shared/hooks/use-toast"
import {useTranslations, useLocale} from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Terminal } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {UserProfile} from "@/types/user"



/** Тип данных профиля, которые приходят от бэкенда */


  

export default function ProfilePage() {
  const t = useTranslations("app.(ui).profile");
  const locale = useLocale()
  // Сопоставление локалей
  const locales = {
    en: enUS,
    ru: ru,
    kk: kk,
  };

  // Определяем локаль для date-fns
  const currentLocale = locales[locale as keyof typeof locales] || enUS;


  const { toast } = useToast();
  // Сессия из next-auth
  const { data: session, status } = useSession();

  // Состояния для данных профиля
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Состояния для модального окна (редактирование)
  const [openEditDialog, setOpenEditDialog] = useState(false);


  // Состояния для модального окна (изменить пароль)
  const [openEditPassword, setOpenEditPassword] = useState(false);


  // Локальные поля формы (чтобы вносить изменения)
  const [editEmail, setEditEmail] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editIsActive, setEditIsActive] = useState(false);
  const [editIsSuperUser, setEditIsSuperUser] = useState(false);
  const [editIsVerified, setEditIsVerified] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  // Локальные поля формы (чтобы вносить изменения для изменения пароля)
  const [editPassword, setEditPassword] = useState<string>("");
  const [editChangePassword, setEditChangePassword] = useState<string>("");
  const [schema, setSchema] = useState<z.ZodSchema | null>(null);
  // -----------------------------
  // 1. ЗАГРУЗКА ПРОФИЛЯ
  // -----------------------------
  useEffect(() => {
    // Ждём, пока пользователь будет авторизован
    if (status !== "authenticated") return;

    async function loadProfile() {
      try {
        // GET /auth/me (интерцептор сам подставит токен)
        const res = await clientApiClient.get<UserProfile>("/auth/me");
        setProfile(res.data);

        // Инициализируем поля для редактирования
        setEditEmail(res.data.email ?? "");
        setEditFirstName(res.data.first_name ?? "");
        setEditLastName(res.data.last_name ?? "");
        setEditIsActive(res.data.is_active ?? false);
        setEditIsSuperUser(res.data.is_superuser ?? false);
        setEditIsVerified(res.data.is_verified ?? false);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          setError(t("noAuth"));
        } else {
          setError(t("error.loadProfile"));
        }
      }
    }

    loadProfile();
  }, [status]);

  useEffect(() => {
    const loadSchema = async () => {
      const s = await createChangePasswordSchema();
      setSchema(s);
    };
    loadSchema();
  }, []);

  // Если сессия ещё инициализируется — можем показать лоадер
  if (status === "loading") {
    return   <div className="container mx-auto p-4">
    <h2 className="text-2xl font-bold mb-6">{t("loading")}</h2>
    <Skeleton className="h-6 w-1/2 mb-4" />
    <Skeleton className="h-12 w-full mb-4" />
    <Skeleton className="h-6 w-1/3 mb-4" />
    <Skeleton className="h-12 w-full mb-4" />
    <Skeleton className="h-6 w-1/4 mb-4" />
    <Skeleton className="h-12 w-full mb-4" />
  </div>

  }


  
  // Если пользователь не авторизован
  if (status === "unauthenticated") {
    return <div className="p-4">{t("authRequred")}</div>;
  }

  // -----------------------------
  // 2. СОХРАНЕНИЕ ИЗМЕНЕНИЙ
  // -----------------------------
  const handleUpdateProfile = async () => {
    if (!profile) return;

    try {
      // PATCH /auth/me — шлём только те поля, которые можно менять
      const res = await clientApiClient.patch<UserProfile>("/auth/me", {
        email: editEmail,
        first_name: editFirstName,
        last_name: editLastName,
        is_active: editIsActive,
        is_superuser: editIsSuperUser,
        is_verified: editIsVerified,
      });

      // Обновляем стейт профиля
      setProfile(res.data);

      // Закрываем модалку
      setOpenEditDialog(false);
      toast({
        title: t("success.refreshProfileHeader"),
        description: t("success.refreshProfile"),

      });
    } catch (err) {
      console.error(t("updateProfile:"), err);
      setError(t("updateProfile"));
    }
  };
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return t("unknown");
    const date = parseISO(dateString);
    return format(date, 'dd MMMM yyyy, HH:mm:ss', { locale: currentLocale });
  };

  const handleChangePassword = async () => {
    if (!schema) return;
    try {
      // Валидация данных

      const validatedData = schema.parse({
        password: editPassword,
        confirmPassword: editChangePassword,
      });
  
      // Если валидация успешна, отправьте данные на сервер
      await clientApiClient.patch("/auth/me/password", {
        new_password: validatedData.password,
      });
  
      // Очистите поля и закройте диалог
      setEditPassword("");
      setEditChangePassword("");
      setOpenEditPassword(false);
      toast({
        title: t("success.refreshPasswordHeader"),
        description: t("success.refreshPassword"),

      });
    } catch (error) {
      if (error instanceof z.ZodError) {
  // Display validation errors in toasts
  error.errors.forEach((err) => {
    toast({
      title: t("error.validationError"),
      description: err.message,
      variant: "destructive",
    });
  });
      } else {
        // Обработка других ошибок
        toast({
            title: t("error.unkownError"),
            description: t("error.unkownErrorMessage"),
            variant: "destructive",
          });
      }
      console.log(error)
    }
  };
  // -------------------------------------
  // JSX: Интерфейс пользователя
  // -------------------------------------
  return (
    <div className="container mx-auto p-6">
      {/* Шапка профиля */}
      <header className="flex items-center gap-6 mb-8">
        <Avatar className="w-24 h-24">
          {/* Если есть avatar_url на бэкенде, можете использовать:
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={`${profile?.first_name} ${profile?.last_name}`}
            />
           */}
          <AvatarImage
            src=""
            alt={`${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`}
          />
          <AvatarFallback>
            {`${profile?.first_name?.[0] ?? "J"}${profile?.last_name?.[0] ?? "D"}`}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-2xl font-bold">
            {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-gray-500">{profile?.email}</p>

          {/* Кнопка «Edit Profile» — открывает диалоговое окно */}
          <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-2">
                {t("edit")}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle> {t("editProfile")}</DialogTitle>
                <DialogDescription>{t("saveHelpMessage")}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Email */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="email">{t("editFields.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editEmail || ""}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

                {/* First Name */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="first_name">{t("editFields.firstname")}</Label>
                  <Input
                    id="first_name"
                    value={editFirstName || ""}
                    onChange={(e) => setEditFirstName(e.target.value)}
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="last_name">{t("editFields.lastname")}</Label>
                  <Input
                    id="last_name"
                    value={editLastName || ""}
                    onChange={(e) => setEditLastName(e.target.value)}
                  />
                </div>

                {/* is_active */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="is_active">{t("editFields.is_active")}</Label>
                  <Switch
                    id="is_active"
                    checked={editIsActive}
                    onCheckedChange={(checked) => setEditIsActive(checked)}
                  />
                </div>

                {/* is_superuser */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="is_superuser">{t("editFields.is_superuser")}</Label>
                  <Switch
                    id="is_superuser"
                    checked={editIsSuperUser}
                    onCheckedChange={(checked) => setEditIsSuperUser(checked)}
                  />
                </div>

                {/* is_verified */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="is_verified">{t("editFields.is_verificate")}</Label>
                  <Switch
                    id="is_verified"
                    checked={editIsVerified}
                    onCheckedChange={(checked) => setEditIsVerified(checked)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
                   {t("button.cancel")}
                </Button>
                <Button onClick={handleUpdateProfile}> {t("button.save")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
   
        </div>
      </header>

      {/* Вывод ошибок, если есть */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Вкладки (Tabs) */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">{t("profileInfo")}</TabsTrigger>
          <TabsTrigger value="settings">{t("settings")}</TabsTrigger>

        </TabsList>

        {/* Profile Info */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>{t("profileInfo")}</CardTitle>
              <CardDescription>{t("basicDetail")}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{t("field")}</TableHead>
        <TableHead>{t("value")}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>{t("editFields.id")}:</TableCell>
        <TableCell><Badge>{profile?.id}</Badge></TableCell>
      </TableRow>
      <TableRow>
        <TableCell>{t("editFields.email")}:</TableCell>
        <TableCell>{profile?.email}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>{t("editFields.firstname")}:</TableCell>
        <TableCell>{profile?.first_name}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>{t("editFields.lastname")}:</TableCell>
        <TableCell>{profile?.last_name}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>{t("editFields.is_active")}:</TableCell>
        <TableCell>{profile?.is_active ? t("yes"): t("no")}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>{t("editFields.is_superuser")}:</TableCell>
        <TableCell>{profile?.is_superuser ? t("yes") : t("no")}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>{t("editFields.is_verificate")}:</TableCell>
        <TableCell>{profile?.is_verified ? t("yes") : t("no")}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>{t("editFields.created_at")}:</TableCell>
        <TableCell>{formatDate(profile?.created_at)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>{t("editFields.updated_at")}:</TableCell>
        <TableCell>{formatDate(profile?.updated_at)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
  <Card>
    <CardHeader>
      <CardTitle>{t("accountSettings")}</CardTitle>
      <CardDescription>{t("manageAccount")}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <Dialog open={openEditPassword} onOpenChange={setOpenEditPassword}>
        <DialogTrigger asChild>
          <Button variant="outline">{t("changePassword")}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("changePassword")}</DialogTitle>
            <DialogDescription>{t("saveHelpMessage")}</DialogDescription>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>{t("passwordHeader")}</AlertTitle>
              <AlertDescription>{t("passwordHelp")}</AlertDescription>
            </Alert>
          </DialogHeader>

          {/* Поля для ввода пароля */}
          <div className="flex flex-col space-y-4">
            {/* Пароль */}
            <div>
              <Label htmlFor="password">{t("editFields.password")}</Label>
              <Input
                id="password"
                type={showPasswords ? "text" : "password"}
                value={editPassword || ""}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder={t("editFields.password")}
              />
            </div>

            {/* Повторить пароль */}
            <div>
              <Label htmlFor="change_password">{t("editFields.changePassword")}</Label>
              <Input
                id="change_password"
                type={showPasswords ? "text" : "password"}
                value={editChangePassword || ""}
                onChange={(e) => setEditChangePassword(e.target.value)}
                placeholder={t("editFields.changePassword")}
              />
            </div>

            {/* Чекбокс для переключения видимости */}
            <div className="flex items-center gap-2">
              <Switch
                id="toggle_password_visibility"
                checked={showPasswords}
                onCheckedChange={(checked) => setShowPasswords(checked)}
              />
              <Label htmlFor="toggle_password_visibility" className="text-sm">
                {t("togglePasswordVisibility")}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditPassword(false)}>
              {t("button.cancel")}
            </Button>
            <Button onClick={handleChangePassword}>{t("button.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="destructive" className="ml-4">
        {t("button.deleteProfile")}
      </Button>
    </CardContent>
  </Card>
</TabsContent>

      </Tabs>
    </div>
  );
}
