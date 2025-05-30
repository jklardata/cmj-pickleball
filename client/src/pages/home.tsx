import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Tablet, 
  UserPlus, 
  UserMinus, 
  List, 
  LogOut, 
  CalendarDays, 
  Circle,
  ChevronUp 
} from "lucide-react";

interface WeeklyGame {
  id: number;
  gameDate: string;
  isFrozen: boolean;
}

interface PlayerRegistration {
  id: number;
  userId: string;
  gameId: number;
  registeredAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPlayerList, setShowPlayerList] = useState(false);

  // Fetch current game
  const { data: currentGame, isLoading: gameLoading } = useQuery<WeeklyGame>({
    queryKey: ["/api/current-game"],
    retry: false,
  });

  // Fetch player registrations
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<PlayerRegistration[]>({
    queryKey: ["/api/game", currentGame?.id, "registrations"],
    enabled: !!currentGame?.id && showPlayerList,
    retry: false,
  });

  // Check user registration status
  const { data: userRegistration } = useQuery<{ isRegistered: boolean }>({
    queryKey: ["/api/my-registration", currentGame?.id],
    enabled: !!currentGame?.id,
    retry: false,
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/register", { gameId: currentGame?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-registration"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game"] });
      toast({
        title: "Success!",
        description: "Successfully signed up for this week's game!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to sign up for the game",
        variant: "destructive",
      });
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/unregister", { gameId: currentGame?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-registration"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game"] });
      toast({
        title: "Success!",
        description: "Successfully removed from this week's player list.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to remove from the game",
        variant: "destructive",
      });
    },
  });

  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatRegistrationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
  };

  const getDisplayName = (firstName: string | null, lastName: string | null, email: string | null) => {
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return email || 'Anonymous User';
  };

  if (gameLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Tablet className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CMJ Pickleball</h1>
                <p className="text-sm text-gray-500">Weekly Player Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {getDisplayName(user?.firstName, user?.lastName, user?.email)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Current Status Banner */}
          {currentGame && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                      <CalendarDays className="text-success h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">This Week's Game</h3>
                      <p className="text-sm text-gray-600">
                        {formatGameDate(currentGame.gameDate)} at 2:00 PM
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      currentGame.isFrozen 
                        ? 'bg-error/20 text-error' 
                        : 'bg-success/20 text-success'
                    }`}>
                      <Circle className="h-2 w-2 mr-2 fill-current" />
                      {currentGame.isFrozen ? 'Registration Closed' : 'Registration Open'}
                    </div>
                    {!currentGame.isFrozen && (
                      <p className="text-xs text-gray-500 mt-1">Closes Friday 11:59 PM</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sign Me Up Button */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto">
                    <UserPlus className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sign Me Up</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Perfect for newcomers to CMJ, learning players, or those wanting a refresher.
                    </p>
                  </div>
                  <Button
                    onClick={() => signUpMutation.mutate()}
                    disabled={signUpMutation.isPending || currentGame?.isFrozen || userRegistration?.isRegistered}
                    className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                  >
                    {signUpMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing Up...
                      </>
                    ) : userRegistration?.isRegistered ? (
                      'Already Registered'
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Join This Week
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Remove Me Button */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-warning/20 rounded-xl flex items-center justify-center mx-auto">
                    <UserMinus className="text-warning h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Remove Me</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Already signed up but can't make it? Remove yourself from the list.
                    </p>
                  </div>
                  <Button
                    onClick={() => removeMutation.mutate()}
                    disabled={removeMutation.isPending || currentGame?.isFrozen || !userRegistration?.isRegistered}
                    className="w-full bg-warning text-white py-3 px-4 rounded-lg font-medium hover:bg-warning/90 focus:ring-2 focus:ring-warning focus:ring-offset-2 transition-colors"
                  >
                    {removeMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Removing...
                      </>
                    ) : !userRegistration?.isRegistered ? (
                      'Not Registered'
                    ) : (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove From List
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Player List Button */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto">
                    <List className="text-secondary h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Player List</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View the current list of players attending this week's game.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowPlayerList(!showPlayerList)}
                    className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-medium hover:bg-secondary/90 focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors"
                  >
                    <List className="h-4 w-4 mr-2" />
                    {showPlayerList ? 'Hide Players' : 'View Players'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player List Section */}
          {showPlayerList && (
            <Card>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Current Player List</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <List className="h-4 w-4" />
                    <span>{registrations.length} player{registrations.length !== 1 ? 's' : ''} registered</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                {registrationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading player list...</p>
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No players registered yet for this week's game.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {registrations.map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {getInitials(registration.user.firstName, registration.user.lastName)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {getDisplayName(registration.user.firstName, registration.user.lastName, registration.user.email)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatRegistrationTime(registration.registeredAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowPlayerList(false)}
                    className="text-secondary hover:text-secondary/80 font-medium"
                  >
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide Player List
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
