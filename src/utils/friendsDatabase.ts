import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  accepted_at: string | null;
  friend_profile?: UserProfile;
}

// Get or create user profile
export const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Search for users by display name to add as friends
export const searchUsers = async (query: string): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('public_user_search')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${query}%`)
      .limit(10);

    if (error) throw error;
    
    // Convert to UserProfile format (missing fields will be null)
    return (data || []).map(user => ({
      ...user,
      email: null,
      created_at: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// Send friend request
export const sendFriendRequest = async (friendId: string): Promise<Friendship> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

// Accept friend request
export const acceptFriendRequest = async (friendshipId: string): Promise<Friendship> => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', friendshipId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

// Get all friendships for current user
export const getFriendships = async (): Promise<Friendship[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        friend_profile:user_profiles!friend_id(*)
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting friendships:', error);
    return [];
  }
};

// Get accepted friends only
export const getFriends = async (): Promise<UserProfile[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Getting friends for user:', user.id);

    // First, let's see all friendships for debugging
    const { data: allFriendships } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
    
    console.log('All friendships for user:', allFriendships);

    // Get friendships where current user is involved
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('user_id, friend_id, status')
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    console.log('Accepted friendships:', friendships);
    if (error) throw error;

    // Extract friend IDs (not current user)
    const friendIds: string[] = [];
    friendships?.forEach(friendship => {
      if (friendship.user_id === user.id) {
        friendIds.push(friendship.friend_id);
      } else {
        friendIds.push(friendship.user_id);
      }
    });

    console.log('Friend IDs:', friendIds);

    if (friendIds.length === 0) return [];

    // Debug the exact friendship record that should allow access
    console.log('Current user ID:', user.id);
    console.log('Friend ID we\'re trying to access:', friendIds[0]);
    
    // Check if the RLS policy query would work
    const { data: policyTest } = await supabase
      .from('friendships')
      .select('*')
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .or(`user_id.eq.${user.id},friend_id.eq.${friendIds[0]}`);
    
    console.log('Friendship records that should grant access:', policyTest);
    
    // Test RLS policy by trying to get profiles one by one
    console.log('Testing RLS policy for friend IDs:', friendIds);
    
    for (const friendId of friendIds) {
      const { data: singleFriend, error: singleError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', friendId)
        .single();
      
      console.log(`Profile for ${friendId}:`, singleFriend, 'Error:', singleError);
    }
    
    // Get user profiles for friend IDs
    const { data: friends, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('id', friendIds);

    console.log('Friend profiles (batch query):', friends);
    console.log('Profile error:', profileError);
    if (profileError) throw profileError;
    return friends || [];
  } catch (error) {
    console.error('Error getting friends:', error);
    return [];
  }
};

// Remove friendship
export const removeFriendship = async (friendshipId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing friendship:', error);
    throw error;
  }
};

// Get friend requests for current user (both incoming and outgoing)
export const getFriendRequests = async (): Promise<{incoming: Friendship[], outgoing: Friendship[]}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get incoming requests (where current user is friend_id)
    const { data: incomingFriendships, error: incomingError } = await supabase
      .from('friendships')
      .select('*')
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (incomingError) throw incomingError;

    // Get outgoing requests (where current user is user_id)
    const { data: outgoingFriendships, error: outgoingError } = await supabase
      .from('friendships')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (outgoingError) throw outgoingError;

    // Get user profiles for incoming requests (requesters)
    const incomingUserIds = incomingFriendships?.map(f => f.user_id) || [];
    const { data: incomingProfiles } = incomingUserIds.length > 0 ? 
      await supabase.from('user_profiles').select('*').in('id', incomingUserIds) : 
      { data: [] };

    // Get user profiles for outgoing requests (recipients)
    const outgoingUserIds = outgoingFriendships?.map(f => f.friend_id) || [];
    const { data: outgoingProfiles } = outgoingUserIds.length > 0 ? 
      await supabase.from('user_profiles').select('*').in('id', outgoingUserIds) : 
      { data: [] };

    // Combine friendship data with profiles
    const incoming = incomingFriendships?.map(friendship => ({
      ...friendship,
      friend_profile: incomingProfiles?.find(p => p.id === friendship.user_id)
    })) || [];

    const outgoing = outgoingFriendships?.map(friendship => ({
      ...friendship,
      friend_profile: outgoingProfiles?.find(p => p.id === friendship.friend_id)
    })) || [];

    return {
      incoming,
      outgoing
    };
  } catch (error) {
    console.error('Error getting friend requests:', error);
    return { incoming: [], outgoing: [] };
  }
};

// Cancel friend request (delete pending request where current user is sender)
export const cancelFriendRequest = async (friendshipId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .eq('user_id', user.id)  // Only allow canceling own requests
      .eq('status', 'pending');

    if (error) throw error;
  } catch (error) {
    console.error('Error canceling friend request:', error);
    throw error;
  }
};

// Decline friend request (delete pending request where current user is recipient)
export const declineFriendRequest = async (friendshipId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .eq('friend_id', user.id)  // Only allow declining requests sent to you
      .eq('status', 'pending');

    if (error) throw error;
  } catch (error) {
    console.error('Error declining friend request:', error);
    throw error;
  }
};