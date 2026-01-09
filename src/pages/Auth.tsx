import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import logoMontseguro from "@/assets/logo-montseguro.png";
import { login, isAuthenticated } from "@/lib/auth";

const authSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Usuário é obrigatório")
    .max(255, "Usuário muito longo"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .max(72, "Senha muito longa"),
});

export default function Auth() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Verificar se já está autenticado
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
    setCheckingSession(false);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = authSchema.safeParse({ username, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      await login(username.trim(), password);
      toast.success("Login realizado com sucesso!");
      navigate("/", { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ backgroundColor: "hsl(222, 47%, 11%)" }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center px-4"
      style={{ backgroundColor: "hsl(222, 47%, 11%)" }}
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <img
          src={logoMontseguro}
          alt="Montseguro"
          className="h-28 w-auto brightness-0 invert"
        />
        <p className="mt-4 text-sm text-sidebar-foreground/60">
          Sistema de Acompanhamento do Financeiro
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-8 backdrop-blur-sm">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-white">Bem-vindo</h2>
          <p className="mt-1 text-sm text-sidebar-foreground/60">
            Entre com suas credenciais para acessar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-sm font-medium text-white"
            >
              Usuário
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-11 border-sidebar-border bg-sidebar text-white placeholder:text-sidebar-foreground/40 focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-white"
            >
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
