import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(72, "Senha muito longa"),
});

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/", { replace: true });
        }
        setCheckingSession(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/", { replace: true });
      }
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Login realizado com sucesso!");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email já está cadastrado");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Conta criada com sucesso!");
        }
      }
    } catch (error) {
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-sidebar-primary">
            <span className="text-sm font-bold text-sidebar-primary-foreground">DB</span>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">DashBrabo</span>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-sidebar-foreground">
            Gerencie sua equipe comercial
          </h1>
          <p className="text-sidebar-foreground/70 max-w-md">
            Acompanhe salários, comissões, metas e performance de toda a sua equipe em um só lugar.
          </p>
        </div>
        
        <p className="text-xs text-sidebar-foreground/50">
          © 2024 DashBrabo. Todos os direitos reservados.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <span className="text-sm font-bold text-primary-foreground">DB</span>
            </div>
            <span className="text-lg font-semibold text-foreground">DashBrabo</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {isLogin ? "Entrar na conta" : "Criar conta"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Digite suas credenciais para acessar"
                : "Preencha os dados para se cadastrar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isLogin ? (
                "Entrar"
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isLogin ? (
                <>
                  Não tem conta?{" "}
                  <span className="font-medium text-primary">Cadastre-se</span>
                </>
              ) : (
                <>
                  Já tem conta?{" "}
                  <span className="font-medium text-primary">Entrar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
