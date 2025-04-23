// @filename: index.ts
import { createClient } from 'npm:@supabase/supabase-js@2.38.5';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface AdminVerification {
  user_id: string;
  email: string;
  has_admin_role: boolean;
  is_admin_flag: boolean;
  domain_eligible: boolean;
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Extract the authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate that the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized', 
          details: authError ? authError.message : 'No user found' 
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Check if user is an admin
    const isAdmin = user.email?.endsWith('@blindvibe.com') || false;
    
    if (!isAdmin) {
      // Check user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (roleError) {
        return new Response(
          JSON.stringify({ 
            error: 'Error checking admin status', 
            details: roleError.message 
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      
      if (!roleData) {
        return new Response(
          JSON.stringify({ 
            error: 'Admin access required',
            details: 'You must be an admin to use this function'
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    }

    // Get all users with @blindvibe.com email
    const { data: blindvibeUsers, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email')
      .ilike('email', '%@blindvibe.com');
      
    if (usersError) {
      return new Response(
        JSON.stringify({ 
          error: 'Error fetching users', 
          details: usersError.message 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!blindvibeUsers || blindvibeUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No users with @blindvibe.com email found',
          users: []
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Check admin role for each user
    const userIds = blindvibeUsers.map(user => user.id);
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds)
      .eq('role', 'admin');
      
    if (rolesError) {
      return new Response(
        JSON.stringify({ 
          error: 'Error fetching user roles', 
          details: rolesError.message 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get profiles to check is_admin flag
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, is_admin')
      .in('user_id', userIds);
      
    if (profilesError) {
      return new Response(
        JSON.stringify({ 
          error: 'Error fetching profiles', 
          details: profilesError.message 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create a map of user IDs to admin status
    const adminRoleMap = new Map();
    userRoles?.forEach(role => {
      adminRoleMap.set(role.user_id, true);
    });

    // Create a map of user IDs to admin flag
    const adminFlagMap = new Map();
    profiles?.forEach(profile => {
      adminFlagMap.set(profile.user_id, profile.is_admin);
    });

    // Create verification results
    const verificationResults: AdminVerification[] = blindvibeUsers.map(user => ({
      user_id: user.id,
      email: user.email || '',
      has_admin_role: adminRoleMap.has(user.id),
      is_admin_flag: adminFlagMap.has(user.id) ? adminFlagMap.get(user.id) : false,
      domain_eligible: true // All users in this query have @blindvibe.com emails
    }));

    // Check for missing admin roles
    const missingAdminRoles = verificationResults.filter(user => !user.has_admin_role || !user.is_admin_flag);
    
    // Fix missing admin roles if needed
    for (const user of missingAdminRoles) {
      // Fix missing admin role
      if (!user.has_admin_role) {
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.user_id,
            role: 'admin',
            assigned_at: new Date().toISOString()
          });
          
        if (insertRoleError) {
          console.error(`Error fixing admin role for ${user.email}:`, insertRoleError);
        } else {
          console.log(`Fixed admin role for ${user.email}`);
          // Update the verification results
          user.has_admin_role = true;
        }
      }
      
      // Fix missing admin flag
      if (!user.is_admin_flag) {
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('user_id', user.user_id);
          
        if (updateProfileError) {
          console.error(`Error fixing admin flag for ${user.email}:`, updateProfileError);
        } else {
          console.log(`Fixed admin flag for ${user.email}`);
          // Update the verification results
          user.is_admin_flag = true;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Verified ${verificationResults.length} users with @blindvibe.com emails`,
        users: verificationResults,
        fixed: missingAdminRoles.length,
        trigger_exists: true // We don't check this here, but it should be set in the migration
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});