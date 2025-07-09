import React from 'react';
import { Users, Target, Globe, Heart, Linkedin, Twitter } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function About() {
  const boardMembers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'CEO & Founder',
      bio: 'Former Tesla energy engineer with 15+ years in renewable energy systems and sustainable technology development.',
      image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO',
      bio: 'Blockchain and fintech expert, previously at Coinbase and Stripe, specializing in transparent financial systems.',
      image: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'Dr. Amara Okafor',
      role: 'Head of Impact',
      bio: 'Development economist with expertise in sustainable development programs across emerging markets.',
      image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      linkedin: '#',
      twitter: '#',
    },
  ];

  const values = [
    {
      icon: Target,
      title: 'Transparency',
      description: 'Every dollar is tracked with blockchain technology, ensuring complete visibility into how funds are used.',
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'We connect projects worldwide, creating a network of positive change across communities and continents.',
    },
    {
      icon: Heart,
      title: 'Community-Driven',
      description: 'Our platform is built by and for people who believe in the power of collective action.',
    },
    {
      icon: Users,
      title: 'Sustainable Growth',
      description: 'We focus on projects that create lasting impact and can be sustained long-term by local communities.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Mission Statement */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-primary">About Impact Mining</h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          We're building a transparent, community-driven platform that connects innovative projects 
          with passionate supporters, creating lasting positive change through renewable energy, 
          education, and sustainable development.
        </p>
      </div>

      {/* Vision & Mission */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
              <Target className="w-6 h-6" />
              Our Mission
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              To democratize impact investing by creating a transparent, accessible platform where 
              innovative projects can find the support they need to create lasting positive change. 
              We believe that when communities have access to the right resources and support, 
              they can solve their own challenges and build a more sustainable future.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Our Vision
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              A world where innovative solutions to global challenges are never held back by lack 
              of funding or support. We envision a future where technology and human compassion 
              work together to create sustainable energy systems, quality education, and thriving 
              communities worldwide.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">Our Core Values</h2>
          <p className="text-gray-600 mt-2">The principles that guide everything we do</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Leadership Team */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">Leadership Team</h2>
          <p className="text-gray-600 mt-2">Meet the people driving our mission forward</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {boardMembers.map((member, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-primary mb-1">{member.name}</h3>
                <p className="text-secondary font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                <div className="flex justify-center space-x-3">
                  <a
                    href={member.linkedin}
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-primary" />
                  </a>
                  <a
                    href={member.twitter}
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Twitter className="w-4 h-4 text-primary" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Governance */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold text-primary">Governance & Transparency</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How We Operate</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• All project approvals go through our independent review board</li>
                <li>• Financial records are audited quarterly by third-party firms</li>
                <li>• Community feedback directly influences platform development</li>
                <li>• Regular impact reports are published for public review</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Transparency</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• 95% of donations go directly to projects</li>
                <li>• 5% covers platform operations and development</li>
                <li>• All transactions are recorded on blockchain</li>
                <li>• Monthly financial reports available to all users</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="bg-primary/5 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Join Our Mission</h2>
        <p className="text-gray-600 mb-6">
          Whether you're a project creator, supporter, or advocate for change, 
          there's a place for you in our community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/projects"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Explore Projects
          </a>
          <a
            href="/submit"
            className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Submit Your Project
          </a>
        </div>
      </div>
    </div>
  );
}