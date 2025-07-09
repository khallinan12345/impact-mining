import React, { useState } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface SubmissionData {
  orgName: string;
  email: string;
  proposalMd: string;
  budgetUsd: string;
  initialKpis: {
    expectedBeneficiaries: string;
    timelineMonths: string;
    kwhTarget: string;
    studentsTarget: string;
  };
}

export function Submit() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionData, setSubmissionData] = useState<SubmissionData>({
    orgName: '',
    email: '',
    proposalMd: '',
    budgetUsd: '',
    initialKpis: {
      expectedBeneficiaries: '',
      timelineMonths: '',
      kwhTarget: '',
      studentsTarget: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('donee_submissions')
        .insert({
          org_name: submissionData.orgName,
          proposal_md: submissionData.proposalMd,
          budget_usd: parseFloat(submissionData.budgetUsd),
          initial_kpis: submissionData.initialKpis,
          submitted_by: submissionData.email,
          status: 'pending',
        });

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Error submitting proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return submissionData.orgName.trim() && submissionData.email.trim();
      case 2:
        return submissionData.proposalMd.trim() && submissionData.budgetUsd.trim();
      case 3:
        return submissionData.initialKpis.expectedBeneficiaries.trim() && 
               submissionData.initialKpis.timelineMonths.trim();
      default:
        return false;
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="text-6xl text-green-500 mb-4">✅</div>
        <h1 className="text-3xl font-bold text-primary">Submission Received!</h1>
        <p className="text-xl text-gray-600">
          Thank you for your project submission. We'll review it and get back to you within 5-7 business days.
        </p>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Our team will review your proposal</li>
            <li>• You'll receive a confirmation email shortly</li>
            <li>• We may reach out for additional information</li>
            <li>• Approved projects will be featured on our platform</li>
          </ul>
        </div>
        <Button asChild>
          <a href="/projects">Browse Current Projects</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Submit Your Project</h1>
        <p className="text-gray-600 mt-2">
          Share your impactful project with our community
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < totalSteps && (
              <div
                className={`w-12 h-1 mx-2 ${
                  step < currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-center space-x-16 text-sm">
        <span className={currentStep >= 1 ? 'text-primary font-medium' : 'text-gray-500'}>
          Organization
        </span>
        <span className={currentStep >= 2 ? 'text-primary font-medium' : 'text-gray-500'}>
          Proposal
        </span>
        <span className={currentStep >= 3 ? 'text-primary font-medium' : 'text-gray-500'}>
          Impact Goals
        </span>
      </div>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-primary">
            Step {currentStep} of {totalSteps}
          </h2>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your organization name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={submissionData.orgName}
                  onChange={(e) => setSubmissionData({
                    ...submissionData,
                    orgName: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={submissionData.email}
                  onChange={(e) => setSubmissionData({
                    ...submissionData,
                    email: e.target.value
                  })}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📋 Submission Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Projects must focus on renewable energy, education, or community development</li>
                  <li>• Provide clear, measurable impact goals</li>
                  <li>• Include realistic budget and timeline</li>
                  <li>• Demonstrate organizational capacity</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Proposal *
                </label>
                <textarea
                  rows={10}
                  placeholder="Describe your project in detail. Include the problem you're solving, your solution, methodology, and expected outcomes. Use markdown formatting if desired."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={submissionData.proposalMd}
                  onChange={(e) => setSubmissionData({
                    ...submissionData,
                    proposalMd: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Budget (USD) *
                </label>
                <input
                  type="number"
                  min="100"
                  step="0.01"
                  placeholder="Enter total project budget"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={submissionData.budgetUsd}
                  onChange={(e) => setSubmissionData({
                    ...submissionData,
                    budgetUsd: e.target.value
                  })}
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">💡 Writing Tips</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Be specific about your project's unique value proposition</li>
                  <li>• Include relevant experience and qualifications</li>
                  <li>• Explain how you'll measure success</li>
                  <li>• Describe the long-term sustainability plan</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Beneficiaries *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Number of people impacted"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={submissionData.initialKpis.expectedBeneficiaries}
                    onChange={(e) => setSubmissionData({
                      ...submissionData,
                      initialKpis: {
                        ...submissionData.initialKpis,
                        expectedBeneficiaries: e.target.value
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline (Months) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    placeholder="Project duration"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={submissionData.initialKpis.timelineMonths}
                    onChange={(e) => setSubmissionData({
                      ...submissionData,
                      initialKpis: {
                        ...submissionData.initialKpis,
                        timelineMonths: e.target.value
                      }
                    })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    kWh Target (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Renewable energy generated"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={submissionData.initialKpis.kwhTarget}
                    onChange={(e) => setSubmissionData({
                      ...submissionData,
                      initialKpis: {
                        ...submissionData.initialKpis,
                        kwhTarget: e.target.value
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Students Target (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Students educated/supported"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={submissionData.initialKpis.studentsTarget}
                    onChange={(e) => setSubmissionData({
                      ...submissionData,
                      initialKpis: {
                        ...submissionData.initialKpis,
                        studentsTarget: e.target.value
                      }
                    })}
                  />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">🎯 Success Metrics</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Define clear, measurable outcomes</li>
                  <li>• Set realistic but ambitious targets</li>
                  <li>• Consider both quantitative and qualitative impacts</li>
                  <li>• Plan for regular progress reporting</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!isStepValid(currentStep)}
              >
                Submit Proposal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}