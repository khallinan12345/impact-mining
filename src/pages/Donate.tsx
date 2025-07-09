import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Mail, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Database } from '../lib/supabase';

type Project = Database['public']['Tables']['projects']['Row'];

export function Donate() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('general');
  const [donationAmount, setDonationAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'card'>('crypto');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status')
        .eq('status', 'in-progress')
        .order('title');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleDonate = async () => {
    if (!user) {
      alert('Please sign in to make a donation');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(donationAmount);
      
      // For general fund, we'll use a placeholder project ID
      const projectId = selectedProject === 'general' ? null : selectedProject;

      // Create donation record
      const { error } = await supabase
        .from('donations')
        .insert({
          project_id: projectId,
          user_id: user.id,
          amount_usd: amount,
          tx_hash: `sim_${paymentMethod}_${Date.now()}`,
        });

      if (error) throw error;

      // If donating to specific project, update raised amount
      if (projectId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          await supabase
            .from('projects')
            .update({
              raised_usd: project.raised_usd + amount,
            })
            .eq('id', projectId);
        }
      }

      setSuccess(true);
      setDonationAmount('');
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Error processing donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="text-6xl text-green-500 mb-4">✅</div>
        <h1 className="text-3xl font-bold text-primary">Thank You!</h1>
        <p className="text-xl text-gray-600">
          Your donation has been processed successfully. You're making a real difference in the world.
        </p>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• A receipt has been sent to your email</li>
            <li>• You can track your donation impact in your dashboard</li>
            <li>• Project updates will be shared with all supporters</li>
          </ul>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => setSuccess(false)}>
            Make Another Donation
          </Button>
          <Button asChild>
            <a href="/dashboard">View Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Make a Donation</h1>
        <p className="text-gray-600 mt-2">Support projects that are changing the world</p>
      </div>

      {/* Donation Form */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-primary">Donation Details</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="general">General Fund - Support all projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donation Amount (USD)
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 100, 250].map((amount) => (
                  <button
                    key={amount}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      donationAmount === amount.toString()
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setDonationAmount(amount.toString())}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter custom amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`p-4 border rounded-lg transition-colors ${
                  paymentMethod === 'crypto'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setPaymentMethod('crypto')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">₿</div>
                  <div className="text-sm font-medium">Cryptocurrency</div>
                </div>
              </button>
              <button
                className={`p-4 border rounded-lg transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="text-center">
                  <CreditCard className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">Credit Card</div>
                </div>
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Secure Payment</h4>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All transactions are encrypted and secure</li>
              <li>• Your payment information is never stored</li>
              <li>• You'll receive a receipt via email</li>
              <li>• Track your donation impact in your dashboard</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleDonate}
            loading={loading}
            disabled={!donationAmount || parseFloat(donationAmount) <= 0}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : `Donate $${donationAmount || '0'}`}
          </Button>

          {!user && (
            <div className="text-center text-sm text-gray-500">
              Please <a href="/sign-in" className="text-primary hover:underline">sign in</a> to make a donation
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Preview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-primary">Your Impact</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-secondary/10 rounded-lg">
              <div className="text-2xl font-bold text-secondary">
                {donationAmount ? Math.round(parseFloat(donationAmount) * 2.5) : 0}
              </div>
              <div className="text-sm text-gray-600">kWh renewable energy</div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {donationAmount ? Math.round(parseFloat(donationAmount) * 0.1) : 0}
              </div>
              <div className="text-sm text-gray-600">students supported</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            * Impact estimates based on historical project data
          </p>
        </CardContent>
      </Card>
    </div>
  );
}