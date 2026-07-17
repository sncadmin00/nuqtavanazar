import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход и регистрация | Debate Club UZ" },
      { name: "description", content: "Войдите или создайте аккаунт, чтобы сохранять кейсы и отслеживать прогресс." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (user && pathname === "/auth") navigate({ to: "/profile" });
  }, [user, navigate, pathname]);

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-center">{t("auth.title")}</h1>
      <Card className="mt-8 p-6 border-border/60 shadow-card">
        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">{t("auth.tab.signin")}</TabsTrigger>
            <TabsTrigger value="signup">{t("auth.tab.signup")}</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-4">
            <SignInForm />
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function SignInForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Добро пожаловать!");
    navigate({ to: "/profile" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>{t("auth.email")}</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label>{t("auth.password")}</Label>
        <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{t("auth.submit.signin")}</Button>
    </form>
  );
}

function SignUpForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        data: { display_name: name },
      },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("auth.signup.checkEmail"));
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>{t("auth.displayName")}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label>{t("auth.email")}</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label>{t("auth.password")}</Label>
        <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{t("auth.submit.signup")}</Button>
    </form>
  );
}
