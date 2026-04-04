import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { ticket_id } = await req.json();
    if (!ticket_id) {
      return new Response(JSON.stringify({ error: "ticket_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check if summary already exists
    const { data: existing } = await supabaseAdmin
      .from("star_summaries")
      .select("id")
      .eq("ticket_id", ticket_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ message: "Summary already exists" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch ticket data
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from("tickets")
      .select("title, description, status, priority, created_at, resolved_at")
      .eq("id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch comments
    const { data: comments } = await supabaseAdmin
      .from("ticket_comments")
      .select("content, is_internal, created_at")
      .eq("ticket_id", ticket_id)
      .order("created_at", { ascending: true });

    const commentsText = (comments ?? [])
      .map(c => `[${c.is_internal ? "INTERNO" : "PÚBLICO"}] ${c.content}`)
      .join("\n");

    const prompt = `Você é um assistente especializado em suporte técnico. Gere um resumo STAR (Situation, Task, Action, Result) em português para o chamado abaixo. Cada seção deve ter 1-3 frases concisas.

Título: ${ticket.title}
Descrição: ${ticket.description}
Prioridade: ${ticket.priority}
Criado em: ${ticket.created_at}
Resolvido em: ${ticket.resolved_at || "N/A"}

Comentários:
${commentsText || "Sem comentários"}

Responda APENAS com um JSON válido no formato:
{"situation":"...","task":"...","action":"...","result":"..."}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Você gera resumos STAR concisos em português. Responda apenas com JSON válido." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "star_summary",
            description: "Structured STAR summary",
            parameters: {
              type: "object",
              properties: {
                situation: { type: "string" },
                task: { type: "string" },
                action: { type: "string" },
                result: { type: "string" },
              },
              required: ["situation", "task", "action", "result"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "star_summary" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    let star: { situation: string; task: string; action: string; result: string };

    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        star = JSON.parse(toolCall.function.arguments);
      } else {
        const content = aiData.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        star = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      }
    } catch {
      console.error("Failed to parse AI response:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Save to database
    const { error: insertError } = await supabaseAdmin
      .from("star_summaries")
      .insert({
        ticket_id,
        situation: star.situation,
        task: star.task,
        action: star.action,
        result: star.result,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, summary: star }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-star-summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
