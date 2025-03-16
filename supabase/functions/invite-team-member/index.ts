import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface InviteRequest {
  email: string;
  role: string;
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
    const { email, role, company_id, inviter_id }: InviteRequest = await req.json();

    // Validate input
    if (!email || !role || !company_id || !inviter_id) {
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

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabaseClient.auth.admin
      .getUserByEmail(email);

    if (userError && userError.message !== 'User not found') {
      throw userError;
    }

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      
      // Check if user is already a team member of this company
      const { data: existingMember } = await supabaseClient
        .from('team_members')
        .select('id, status')
        .eq('id', userId)
        .eq('company_id', company_id)
        .single();

      if (existingMember) {
        if (existingMember.status === 'active') {
          throw new Error('User is already a team member of this company');
        }
        // Update existing invitation
        await supabaseClient
          .from('team_members')
          .update({ role, status: 'invited' })
          .eq('id', userId)
          .eq('company_id', company_id);
      } else {
        // Create new team member record for existing user
        await supabaseClient
          .from('team_members')
          .insert({
            id: userId,
            company_id,
            email,
            role,
            status: 'invited',
            invited_by: inviter_id
          });
      }
    } else {
      // Generate a random password for the new user
      const tempPassword = Math.random().toString(36).slice(-8);

      // Create a new user
      const { data: newUser, error: createError } = await supabaseClient.auth.admin
        .createUser({
          email,
          password: tempPassword,
          email_confirm: true,
        });

      if (createError) throw createError;
      userId = newUser.id;

      // Create team member record
      await supabaseClient
        .from('team_members')
        .insert({
          id: userId,
          company_id,
          email,
          role,
          status: 'invited',
          invited_by: inviter_id
        });
    }

    // Create or update user role
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .upsert({
        user_id: userId,
        company_id,
        role
      });

    if (roleError) throw roleError;

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
            role,
            inviteLink: `${Deno.env.get('APP_URL')}/accept-invite?token=${userId}&company=${company_id}`,
          },
        },
      }
    );

    if (emailError) throw emailError;

    return new Response(
      JSON.stringify({ message: 'Invitation sent successfully' }),
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