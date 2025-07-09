import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign, Zap, GraduationCap, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { supabase } from '../lib/supabase';

interface Stats {
  totalRaised: number;
  totalProjects: number;
  totalDonations: number;
  kwhGenerated: number;
  studentsServed: number;
}

export function Home() {
  const [stats, setStats] = useState<Stats>({
    totalRaised: 0,
    totalProjects: 0,
    totalDonations: 0,
    kwhGenerated: 0,
    studentsServed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total raised and project count
      const { data: projects } = await supabase
        .from('projects')
        .select('raised_usd, kpi_jsonb');

      // Get donation count
      const { count: donationCount } = await supabase
        .from('donations')
        .select('*', { count: 'exact', head: true });

      if (projects) {
        const totalRaised = projects.reduce((sum, project) => sum + project.raised_usd, 0);
        const kwhGenerated = projects.reduce((sum, project) => {
          const kpis = project.kpi_jsonb || {};
          return sum + (kpis.kwh_generated || 0);
        }, 0);
        const studentsServed = projects.reduce((sum, project) => {
          const kpis = project.kpi_jsonb || {};
          return sum + (kpis.students_served || 0);
        }, 0);

        setStats({
          totalRaised,
          totalProjects: projects.length,
          totalDonations: donationCount || 0,
          kwhGenerated,
          studentsServed,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Raised',
      value: `$${stats.totalRaised.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-accent',
    },
    {
      title: 'kWh Generated',
      value: stats.kwhGenerated.toLocaleString(),
      icon: Zap,
      color: 'text-secondary',
    },
    {
      title: 'Students Served',
      value: stats.studentsServed.toLocaleString(),
      icon: GraduationCap,
      color: 'text-primary',
    },
    {
      title: 'Total Donations',
      value: stats.totalDonations.toLocaleString(),
      icon: Heart,
      color: 'text-accent',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-primary">
            Impact Mining™
          </h1>
          <p className="text-xl text-secondary font-semibold">
            Hashing an abundant energy future
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We believe in an abundant energy future. But there are billions of people without access to reliable and affordable energy where the path to get there is blocked or slowed. We created Impact Mining to change that by making electricity more affordable in recently energized communities. Impact Mining works by converting donated hashrate into lower electricity prices, allowing people, hospitals, schools, and businesses to use more and do more.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/projects">
              Explore Projects
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button size="lg" asChild>
            <Link to="/submit">
              Create New Project
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/donate">Make an Impact</Link>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <stat.icon className={`w-8 h-8 mx-auto ${stat.color}`} />
                <div className="text-2xl font-bold text-primary">
                  {loading ? '...' : stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mission Section */}
      <div className="bg-surface rounded-xl p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-primary">Turning hashrate into healthcare, education and economic development
            </h2>
            <p className="text-gray-600 leading-relaxed">
            Impact Mining forms partnerships with non-profits and B-corps that are sustainably powering communities in emerging economies 
            and providing the education needed to exploit the power for economic benefit in the community for the short and long term. 
            By combining power and education, we are making microgrids investment-worthy. In 10 years it is our dream that every person 
            on the planet has access to power.
            </p>
            <Button variant="outline" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
          <div className="relative">
            <div className="w-full h-64 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
              <img 
                src="/Impact Mining Global Network.png" 
                alt="Impact Mining Global Network" 
                className="w-full h-full object-contain filter contrast-125 brightness-110"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">How It Works</h2>
          <p className="text-gray-600 mt-2">Simple steps to make a lasting impact</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Discover Projects</h3>
              <p className="text-gray-600">Browse innovative projects making real impact in renewable energy, education, and community development.</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-secondary font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Support Impact</h3>
              <p className="text-gray-600">Contribute to projects that align with your values and track their progress through transparent KPIs.</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-accent font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Share Stories</h3>
              <p className="text-gray-600">Connect with the community and share your impact journey with others who care about positive change.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}