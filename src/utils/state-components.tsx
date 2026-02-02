import { ReactNode } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Componente de estado de carregamento
 */
interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "Carregando vendedores...",
}: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/**
 * Componente de estado de erro
 */
interface ErrorStateProps {
  message?: string;
}

export function ErrorState({
  message = "Erro ao carregar vendedores da API. Por favor, verifique sua conexão e tente novamente.",
}: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

/**
 * Componente de estado vazio
 */
interface EmptyStateProps {
  message?: string;
}

export function EmptyState({
  message = "Nenhum vendedor disponível para sua conta.",
}: EmptyStateProps) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

/**
 * Wrapper condicional que renderiza automaticamente loading/error/empty/children
 */
interface ConditionalRenderProps {
  isLoading: boolean;
  error: unknown;
  isEmpty: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
  children: ReactNode;
}

export function ConditionalRender({
  isLoading,
  error,
  isEmpty,
  loadingMessage,
  errorMessage,
  emptyMessage,
  children,
}: ConditionalRenderProps) {
  if (error && isEmpty) {
    return <ErrorState message={errorMessage} />;
  }

  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (isEmpty) {
    return <EmptyState message={emptyMessage} />;
  }

  return children;
}
