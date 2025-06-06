
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Export groups using the new redesigned structure
    const { data: memberGroups, error: groupsError } = await supabase
      .from('membros_grupos')
      .select(`
        grupos_estudo (
          id,
          nome,
          descricao,
          tipo_grupo,
          criador_id,
          is_public,
          is_visible_to_all,
          is_visible_to_partners,
          disciplina_area,
          topico_especifico,
          tags,
          created_at
        )
      `)
      .eq('user_id', user.id)

    if (groupsError) {
      console.error('Error fetching user groups:', groupsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch groups' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract groups from the join result
    const allGroups = memberGroups?.map(mg => mg.grupos_estudo).filter(Boolean) || []

    console.log(`Exported ${allGroups.length} groups for user ${user.id}`)

    return new Response(
      JSON.stringify(allGroups),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in export-groups function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
