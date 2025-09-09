import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, TextField, InputAdornment, Button, Divider, Badge } from '@mui/material';
import { Search as SearchIcon, PersonAdd as PersonAddIcon, Check as CheckIcon, Close as CloseIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { getFriends, searchUsers, sendFriendRequest, getFriendRequests, acceptFriendRequest, declineFriendRequest, cancelFriendRequest, type UserProfile, type Friendship } from '../utils/friendsDatabase';

export const Friends: React.FC = () => {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState<{incoming: Friendship[], outgoing: Friendship[]}>({incoming: [], outgoing: []});
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [friendsList, requests] = await Promise.all([
          getFriends(),
          getFriendRequests()
        ]);
        setFriends(friendsList);
        setFriendRequests(requests);
      } catch (err) {
        setError('Failed to load friends data');
        console.error('Error loading friends:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Search for users
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchUsers(query);
      // Get current user ID
      const { data: { user } } = await (await import('../lib/supabase')).supabase.auth.getUser();
      const currentUserId = user?.id;
      
      // Filter out current user and existing friends
      const friendIds = new Set(friends.map(f => f.id));
      const filteredResults = results.filter(user => 
        user.id !== currentUserId &&
        !friendIds.has(user.id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Send friend request
  const handleSendFriendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      // Remove user from search results after sending request
      setSearchResults(prev => prev.filter(user => user.id !== userId));
      // Reload friend requests to show the new outgoing request
      const requests = await getFriendRequests();
      setFriendRequests(requests);
    } catch (err) {
      console.error('Error sending friend request:', err);
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await acceptFriendRequest(friendshipId);
      // Reload data to show new friend and remove from requests
      const [friendsList, requests] = await Promise.all([
        getFriends(),
        getFriendRequests()
      ]);
      setFriends(friendsList);
      setFriendRequests(requests);
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  // Decline friend request
  const handleDeclineRequest = async (friendshipId: string) => {
    try {
      await declineFriendRequest(friendshipId);
      // Remove from incoming requests
      setFriendRequests(prev => ({
        ...prev,
        incoming: prev.incoming.filter(req => req.id !== friendshipId)
      }));
    } catch (err) {
      console.error('Error declining friend request:', err);
    }
  };

  // Cancel friend request
  const handleCancelRequest = async (friendshipId: string) => {
    try {
      await cancelFriendRequest(friendshipId);
      // Remove from outgoing requests
      setFriendRequests(prev => ({
        ...prev,
        outgoing: prev.outgoing.filter(req => req.id !== friendshipId)
      }));
    } catch (err) {
      console.error('Error canceling friend request:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, textAlign: 'center' }}>
        Friends' Recipe Collections
      </Typography>

      {/* Search Section */}
      <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        <TextField
          fullWidth
          placeholder="Search for friends by name..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Search Results */}
        {searchQuery && (
          <Box>
            {searchLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : searchResults.length > 0 ? (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Search Results
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  {searchResults.map((user) => (
                    <Box
                      key={user.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        border: 1,
                        borderColor: theme.palette.divider,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.display_name || 'User'}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Box 
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.primary.main,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '1rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {(user.display_name || '?')[0].toUpperCase()}
                          </Box>
                        )}
                        <Typography variant="body1">
                          {user.display_name || 'User'}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PersonAddIcon />}
                        onClick={() => handleSendFriendRequest(user.id)}
                      >
                        Add Friend
                      </Button>
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ my: 3 }} />
              </Box>
            ) : searchQuery.trim().length >= 2 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No users found
              </Typography>
            ) : null}
          </Box>
        )}
      </Box>

      {/* Friend Requests Section */}
      {(friendRequests.incoming.length > 0 || friendRequests.outgoing.length > 0) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Friend Requests
          </Typography>

          {/* Incoming Requests */}
          {friendRequests.incoming.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                Incoming Requests
                <Badge badgeContent={friendRequests.incoming.length} color="primary" />
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {friendRequests.incoming.map((request: any) => (
                  <Box
                    key={request.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      border: 1,
                      borderColor: theme.palette.primary.main,
                      borderRadius: 2,
                      backgroundColor: theme.palette.primary.light + '10'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {request.requester?.avatar_url ? (
                        <img 
                          src={request.requester.avatar_url} 
                          alt={request.requester.display_name || 'User'}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Box 
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {(request.requester?.display_name || '?')[0].toUpperCase()}
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body1">
                          {request.requester?.display_name || 'User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Wants to be your friend
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={() => handleAcceptRequest(request.id)}
                        color="success"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloseIcon />}
                        onClick={() => handleDeclineRequest(request.id)}
                        color="error"
                      >
                        Decline
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Outgoing Requests */}
          {friendRequests.outgoing.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Sent Requests ({friendRequests.outgoing.length})
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {friendRequests.outgoing.map((request: any) => (
                  <Box
                    key={request.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      border: 1,
                      borderColor: theme.palette.divider,
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {request.recipient?.avatar_url ? (
                        <img 
                          src={request.recipient.avatar_url} 
                          alt={request.recipient.display_name || 'User'}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Box 
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.grey[400],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {(request.recipient?.display_name || '?')[0].toUpperCase()}
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body1">
                          {request.recipient?.display_name || 'User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Request pending
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={() => handleCancelRequest(request.id)}
                      color="secondary"
                    >
                      Cancel
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />
        </Box>
      )}

      {/* Friends List */}
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        Your Friends ({friends.length})
      </Typography>

      {friends.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            No friends yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add friends to explore their recipe collections!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3, px: 2 }}>
          {friends.map((friend) => (
            <Box
              key={friend.id}
              sx={{
                p: 3,
                border: 1,
                borderColor: theme.palette.divider,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: 2
                }
              }}
              onClick={() => navigate(`/friends/${friend.id}`)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {friend.avatar_url ? (
                  <img 
                    src={friend.avatar_url} 
                    alt={friend.display_name || 'Friend'}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box 
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {(friend.display_name || friend.email || '?')[0].toUpperCase()}
                  </Box>
                )}
                <Box>
                  <Typography variant="h6">
                    {friend.display_name || friend.email || 'Unknown User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to view recipes
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};