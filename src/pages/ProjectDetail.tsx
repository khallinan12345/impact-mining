import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Target, TrendingUp, Users, Zap, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Database } from '../lib/supabase';

type Project = Database['public']['Tables']['projects']['Row'];

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationLoading, setDonationLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!user || !project || !donationAmount) return;

    setDonationLoading(true);
    try {
      const amount = parseFloat(donationAmount);
      
      // Create donation record
      const { error } = await supabase
        .from('donations')
        .insert({
          project_id: project.id,
          user_id: user.id,
          amount_usd: amount,
          tx_hash: `sim_${Date.now()}`, // Simulated transaction hash
        });

      if (error) throw error;

      // Update project raised amount
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          raised_usd: project.raised_usd + amount,
        })
        .eq('id', project.id);

      if (updateError) throw updateError;

      // Refresh project data
      await fetchProject();
      setDonateModalOpen(false);
      setDonationAmount('');
      alert('Donation successful! Thank you for your support.');
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Error processing donation. Please try again.');
    } finally {
      setDonationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="w-32 h-8 bg-gray-200 rounded mb-4"></div>
          <div className="w-3/4 h-8 bg-gray-200 rounded mb-2"></div>
          <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">Project Not Found</h2>
        <p className="text-gray-500 mb-4">The project you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const progressPercentage = (project.raised_usd / project.target_usd) * 100;
  const kpis = project.kpi_jsonb || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link to="/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
      </div>

      {/* Project Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-primary">{project.title}</h1>
        <p className="text-xl text-gray-600">{project.summary}</p>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Created {new Date(project.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {project.status}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Project Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Project Image */}
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center overflow-hidden">
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl">🌱</div>
            )}
          </div>

          {/* Project Description */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-primary">About This Project</h2>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{project.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          {Object.keys(kpis).length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold text-primary">Key Performance Indicators</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {kpis.kwh_generated && (
                    <div className="text-center p-4 bg-secondary/10 rounded-lg">
                      <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <div className="text-2xl font-bold text-primary">{kpis.kwh_generated.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">kWh Generated</div>
                    </div>
                  )}
                  {kpis.students_served && (
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <GraduationCap className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold text-primary">{kpis.students_served.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Students Served</div>
                    </div>
                  )}
                  {kpis.beneficiaries && (
                    <div className="text-center p-4 bg-accent/10 rounded-lg">
                      <Users className="w-8 h-8 text-accent mx-auto mb-2" />
                      <div className="text-2xl font-bold text-primary">{kpis.beneficiaries.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Beneficiaries</div>
                    </div>
                  )}
                  {kpis.co2_offset && (
                    <div className="text-center p-4 bg-green-100 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-primary">{kpis.co2_offset.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Tons CO₂ Offset</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Funding Info */}
        <div className="space-y-6">
          {/* Funding Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    ${project.raised_usd.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    raised of ${project.target_usd.toLocaleString()} goal
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-secondary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  {progressPercentage.toFixed(1)}% funded
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => user ? setDonateModalOpen(true) : alert('Please sign in to donate')}
                >
                  Support This Project
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-primary">Project Timeline</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Project Created</div>
                    <div className="text-xs text-gray-500">
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    project.status === 'in-progress' || project.status === 'completed' 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium">In Progress</div>
                    <div className="text-xs text-gray-500">
                      {project.status === 'in-progress' || project.status === 'completed' 
                        ? 'Active' 
                        : 'Pending'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    project.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium">Completed</div>
                    <div className="text-xs text-gray-500">
                      {project.status === 'completed' ? 'Done' : 'Upcoming'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Donation Modal */}
      <Modal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        title="Support This Project"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">{project.title}</h3>
            <p className="text-gray-600">Your contribution will help make this project a reality.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Donation Amount (USD)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Payment Method</h4>
              <div className="text-sm text-gray-600">
                <p>🔒 Secure payment processing</p>
                <p>💳 Crypto and traditional payments supported</p>
                <p>📧 Receipt will be sent to your email</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDonateModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDonate}
                loading={donationLoading}
                disabled={!donationAmount || parseFloat(donationAmount) <= 0}
                className="flex-1"
              >
                Donate ${donationAmount || '0'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}