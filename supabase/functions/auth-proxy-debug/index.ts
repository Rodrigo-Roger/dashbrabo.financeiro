import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const API_BASE_URL = "https://ms.moskit.montseguro.link/api";
const API_KEY =
  "i7YH9f-Or6D_2HUUR01IRnhH9sE2_bWCk13BYjZOuC-VF9yOPzJG1ZS_IwvIiSzE";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔍 Debug Auth Proxy");
    console.log("Request body:", await req.clone().text());

    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({
          error: "Username e password são obrigatórios",
          received: { username, password },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("📤 Enviando para API:", `${API_BASE_URL}/auth/v1/token/`);

    const apiResponse = await fetch(`${API_BASE_URL}/auth/v1/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({ username, password }),
    });

    console.log("📥 Resposta da API - Status:", apiResponse.status);

    const data = await apiResponse.json();

    console.log("📥 Dados da resposta:", data);

    if (!apiResponse.ok) {
      console.error("❌ Erro na API:", data);
      return new Response(
        JSON.stringify({
          error: data.detail || "Credenciais inválidas",
          details: data,
          api_status: apiResponse.status,
        }),
        {
          status: apiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Login bem-sucedido");
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Erro no auth-proxy-debug:", error);
    return new Response(
      JSON.stringify({
        error: "Erro ao conectar com o servidor",
        details: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
