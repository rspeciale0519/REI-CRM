import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError) throw userError
    if (!user) throw new Error('No user found')

    // Get user's roles with company roles
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select(`
        role_id,
        company_roles!inner (
          id,
          name,
          type,
          description
        )
      `)
      .eq('user_id', user.id)

    if (rolesError) throw rolesError

    // Get user's permissions
    const { data: permissions, error: permissionsError } = await supabaseClient
      .from('user_roles')
      .select(`
        company_roles!inner (
          role_permissions!inner (
            company_permissions!inner (
              name,
              description,
              category
            )
          )
        )
      `)
      .eq('user_id', user.id)

    if (permissionsError) throw permissionsError

    // Get team memberships
    const { data: teamMemberships, error: teamError } = await supabaseClient
      .from('team_members')
      .select('role, company_id, email')
      .eq('id', user.id)

    if (teamError) throw teamError

    // Flatten permissions
    const flattenedPermissions = permissions?.flatMap(role => 
      role.company_roles.role_permissions.map(rp => rp.company_permissions)
    ) ?? []

    // Remove duplicates
    const uniquePermissions = Array.from(
      new Map(flattenedPermissions.map(item => [item.name, item])).values()
    )

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
        },
        roles: userRoles?.map(ur => ({
          role: ur.company_roles.name,
          type: ur.company_roles.type
        })),
        permissions: uniquePermissions,
        teamMemberships,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 