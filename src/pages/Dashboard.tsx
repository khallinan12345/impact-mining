import React, { useState, useEffect } from 'react';
import { DollarSign, Heart, TrendingUp, Calendar, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Database } from '../lib/supabase';

type Donation = Database['public']['Tables']['donations']['Row'] & {
  projects: {
    title: string;
  } | null;
};

export function Dashboard() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState({
    totalDonated: 0,
    projectsSupported: 0,
    impactGenerated: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select(`
          *,
          projects (
            title
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (donationsError) throw donationsError;

      const userDonations = donationsData || [];
      setDonations(userDonations);

      // Calculate stats
      const totalDonated = userDonations.reduce((sum, donation) => sum + donation.amount_usd, 0);
      const projectsSupported = new Set(userDonations.map(d => d.project_id)).size;
      const impactGenerated = Math.round(totalDonated * 2.5); // Estimated kWh

      setStats({
        totalDonated,
        projectsSupported,
        impactGenerated,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">Please Sign In</h2>
        <p className="text-gray-500 mb-4">You need to be signed in to view your dashboard.</p>
        <Button asChild>
          <a href="/sign-in">Sign In</a>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="w-48 h-8 bg-gray-200 rounded mb-2"></div>
          <div className="w-96 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Your Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user.email?.split('@')[0]}! Track your impact and contributions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donated</p>
                <p className="text-2xl font-bold text-primary">${stats.totalDonated.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Projects Supported</p>
                <p className="text-2xl font-bold text-primary">{stats.projectsSupported}</p>
              </div>
              <Heart className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Impact Generated</p>
                <p className="text-2xl font-bold text-primary">{stats.impactGenerated.toLocaleString()}</p>
                <p className="text-xs text-gray-500">kWh renewable energy</p>
              </div>
              <TrendingUp className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-primary">Recent Donations</h2>
        </CardHeader>
        <CardContent>
          {donations.length > 0 ? (
            <div className="space-y-4">
              {donations.slice(0, 5).map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {donation.projects?.title || 'General Fund'}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${donation.amount_usd.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {donation.tx_hash?.substring(0, 12)}...
                    </p>
                  </div>
                </div>
              ))}
              {donations.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    View All Donations
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">💝</div>
              <p className="text-gray-600 mb-4">No donations yet</p>
              <Button asChild>
                <a href="/donate">Make Your First Donation</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-primary">Your Impact Summary</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Environmental Impact</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Renewable Energy Generated</span>
                  <span className="font-medium">{stats.impactGenerated.toLocaleString()} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CO₂ Offset</span>
                  <span className="font-medium">{Math.round(stats.impactGenerated * 0.0004)} tons</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Social Impact</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Students Supported</span>
                  <span className="font-medium">{Math.round(stats.totalDonated * 0.1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Community Projects</span>
                  <span className="font-medium">{stats.projectsSupported}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-primary">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="/donate">
                <Heart className="w-4 h-4" />
                Make Another Donation
              </a>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="/projects">
                <Eye className="w-4 h-4" />
                Explore Projects
              </a>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="/stories">
                <TrendingUp className="w-4 h-4" />
                Share Your Story
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}