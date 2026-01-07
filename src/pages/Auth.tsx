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
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-sidebar px-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center">
          <svg viewBox="0 0 100 80" className="h-12 w-12 text-white" fill="currentColor">
            <polygon points="50,5 95,75 5,75" fill="none" stroke="currentColor" strokeWidth="4"/>
            <polygon points="50,25 75,65 25,65" fill="none" stroke="currentColor" strokeWidth="3"/>
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-widest text-white">DASHBRABO</span>
        <p className="mt-2 text-sm text-sidebar-foreground/60">
          Sistema de Acompanhamento Financeiro
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-8 backdrop-blur-sm">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-white">
            {isLogin ? "Bem-vindo" : "Criar conta"}
          </h2>
          <p className="mt-1 text-sm text-sidebar-foreground/60">
            {isLogin
              ? "Entre com suas credenciais para acessar"
              : "Preencha os dados para se cadastrar"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 border-sidebar-border bg-sidebar text-white placeholder:text-sidebar-foreground/40 focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-white">
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
                className="h-11 border-sidebar-border bg-sidebar pr-10 text-white placeholder:text-sidebar-foreground/40 focus:border-primary focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/60 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90" 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLogin ? (
              "Entrar"
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-sidebar-foreground/60 hover:text-white"
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
  );
}
