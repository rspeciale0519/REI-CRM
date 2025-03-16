import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ResendRequest {
  email: string;
  company_id: string;
  inviter_id: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const { email, company_id, inviter_id }: ResendRequest = await req.json();

    // Validate input
    if (!email || !company_id || !inviter_id) {
      throw new Error('Missing required fields');
    }

    // Get inviter details and verify they belong to the company
    const { data: inviter, error: inviterError } = await supabaseClient
      .from('team_members')
      .select('first_name, last_name')
      .eq('id', inviter_id)
      .eq('company_id', company_id)
      .single();

    if (inviterError) throw inviterError;
    if (!inviter) throw new Error('Inviter not found in company');

    // Get company details
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .single();

    if (companyError) throw companyError;
    if (!company) throw new Error('Company not found');

    // Get team member details
    const { data: member, error: memberError } = await supabaseClient
      .from('team_members')
      .select('id, role, status')
      .eq('email', email)
      .eq('company_id', company_id)
      .single();

    if (memberError) throw memberError;
    if (!member) throw new Error('Team member not found');
    if (member.status === 'active') throw new Error('Team member is already active');

    // Update invitation timestamp
    const { error: updateError } = await supabaseClient
      .from('team_members')
      .update({
        invited_at: new Date().toISOString(),
        invited_by: inviter_id,
      })
      .eq('id', member.id)
      .eq('company_id', company_id);

    if (updateError) throw updateError;

    // Send invitation email
    const { error: emailError } = await supabaseClient.functions.invoke(
      'send-email',
      {
        body: {
          to: email,
          template: 'team-invitation',
          data: {
            inviterName: `${inviter.first_name} ${inviter.last_name}`,
            companyName: company.name,
            role: member.role,
            inviteLink: `${Deno.env.get('APP_URL')}/accept-invite?token=${member.id}&company=${company_id}`,
          },
        },
      }
    );

    if (emailError) throw emailError;

    return new Response(
      JSON.stringify({ message: 'Invitation resent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 