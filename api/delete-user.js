import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL=process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Check for Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Verify token and get user
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const userId = user.id;

  try {
    // Delete user from auth.users (Supabase Auth)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error('Error deleting user from auth:', deleteAuthError);
      return res.status(400).json({ error: 'Failed to delete user from auth' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error during deletion:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
