
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

    // Export groups where user is creator or member
    const { data: userGroups, error: groupsError } = await supabase
      .from('grupos_estudo')
      .select(`
        id,
        nome,
        descricao,
        tipo_grupo,
        disciplina_area,
        topico_especifico,
        tags,
        is_publico,
        is_visible_to_all,
        is_visible_to_partners,
        codigo_unico,
        created_at,
        membros
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

    // Also get groups where user is a member
    const { data: memberGroups, error: memberError } = await supabase
      .from('membros_grupos')
      .select(`
        grupos_estudo (
          id,
          nome,
          descricao,
          tipo_grupo,
          disciplina_area,
          topico_especifico,
          tags,
          is_publico,
          is_visible_to_all,
          is_visible_to_partners,
          codigo_unico,
          created_at,
          membros
        )
      `)
      .eq('user_id', user.id)

    if (memberError) {
      console.error('Error fetching member groups:', memberError)
    }

    // Combine and deduplicate groups
    const allGroups = [...(userGroups || [])]
    const memberGroupsData = memberGroups?.map(mg => mg.grupos_estudo).filter(Boolean) || []
    
    memberGroupsData.forEach(group => {
      if (!allGroups.find(g => g.id === group.id)) {
        allGroups.push(group)
      }
    })

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
