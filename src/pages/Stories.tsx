import React, { useState, useEffect } from 'react';
import { Plus, Heart, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Database } from '../lib/supabase';

type Story = Database['public']['Tables']['stories']['Row'] & {
  profiles: {
    display_name: string | null;
  } | null;
};

interface StoryImage {
  src: string;
  alt: string;
  caption: string;
}

interface Partner {
  name: string;
  logo: string;
  role: string;
  description: string;
}

interface FeaturedStory {
  id: string;
  title: string;
  location: string;
  content: string;
  images: StoryImage[];
  partners: Partner[];
  date: string;
  author: string;
}

// Helper function to get the correct image path for both localhost and GitHub Pages
const getImagePath = (filename: string) => {
  // Check if we're on GitHub Pages
  const isGitHubPages = window.location.hostname === 'khallinan12345.github.io';
  return isGitHubPages ? `/impact-mining/${filename}` : `./${filename}`;
};

const featuredStories: FeaturedStory[] = [
  {
    id: 'ozuzu-nigeria',
    title: 'Accelerating Economic Development through Lower Cost Solar Electricity',
    location: 'Ozuzu, Nigeria',
    content: `Before 2021, the community of Ozuzu relied on expensive, polluting diesel generators. That changed with the launch of a 67.2 kW solar microgrid, bringing consistent, clean energy to the entire community. Today, power is delivered at $0.40/kWh, much less than the $3.00/kWh generator rates, but far from economical for many in the community. Impact Mining reduces the rate by 20% community-wide, providing significant economic relief to the 150 homes and businesses and the local school connected to the microgrid.`,
    images: [
      {
        src: getImagePath('Kalobeyei_kids_and_solar.png'),
        alt: 'Village kids and elders with solar installation',
        caption: 'Village kids with elders in front of one of the solar installations that they are so very proud of.'
      },
      {
        src: getImagePath('Kalobeyei_barber.png'),
        alt: 'Barber using electric trimmer',
        caption: 'A barber cutting hair with an electric trimmer. An example of how local people can leverage electricity with lower cost to invest in their businesses.'
      },
      {
        src: getImagePath('Kalobeyei_solar_charging_station.png'),
        alt: 'Solar charging station',
        caption: 'A new solar charging station for people to charge their phones.'
      }
    ],
    partners: [
      {
        name: 'Compass Mining',
        logo: getImagePath('compass_mining.png'),
        role: 'Anchor Donor',
        description: 'World\'s premier bitcoin mining marketplace'
      },
      {
        name: 'Renewvia Energy Africa',
        logo: getImagePath('renewvia.png'),
        role: 'Development Partner',
        description: 'Global solar energy developer'
      }
    ],
    date: 'September 2019',
    author: 'Impact Mining Team'
  },
  {
    id: 'oloibiri-nigeria',
    title: 'AI-driven Computer Lab',
    location: 'Oloibiri, Nigeria',
    content: `Synota Impact mining donations have led to the establishment of a new community AI-driven computer lab with community printing station. Renewvia Energy's solar microgrid made power accessible to the community, but education resources were slim. Education empowers productive use of energy and economic growth from it. The community came together and rehabbed a vacant space - creating one of the most appealing buildings in the community. A small $5,000 donation enabled rehab of the facility, purchase of furniture, purchase of 6 computers, and internet access for two months. Synota's impact mining will pay for internet fees in perpetuity.

Plus Synota's AI facilitated learning platform ("AI-ing and Vibing (in Sub-Saharan Africa)" - https://girls-aiing-and-vibing.vercel.app/) is being used to help develop young people. The lab became functional on July 1, 2025. Young people in the community are already using. And people in the community are using it to get printouts.

AI education will be used to enhance assets in the community (agriculture, business), to create new businesses, and to develop workforce readiness for tech jobs.`,
    images: [
      {
        src: getImagePath('Image_School_Outside_View.jpg'),
        alt: 'AI computer lab exterior',
        caption: 'An outside view of the new community AI computer lab. This initiative reflects the strong partnership established between Synota and Renewvia.'
      },
      {
        src: getImagePath('Image_1_Remodeled_classroom_with_computers.jpg'),
        alt: 'Computer stations interior',
        caption: 'A view of the computer stations accessible to young people (and older people) in the community. "Excited" is an understatement when describing the community\'s response to the lab.'
      },
      {
        src: getImagePath('Image_remodeled_classroom_with_community_printer.jpg'),
        alt: 'Community printer station',
        caption: 'This shows the community printer, the first for the village.'
      }
    ],
    partners: [
      {
        name: 'Synota',
        logo: getImagePath('synota_image.png'),
        role: 'Anchor Donor',
        description: 'Financial Energy Transaction Agent'
      },
      {
        name: 'Renewvia Energy Africa',
        logo: getImagePath('renewvia.png'),
        role: 'Development Partner',
        description: 'Global solar energy developer'
      }
    ],
    date: 'July 1, 2025',
    author: 'Synota Team'
  },
  {
    id: 'oloibiri-hospital',
    title: 'Expanding Healthcare Access by Zeroing Out Costs in the Local Hospital',
    location: 'Oloibiri, Nigeria',
    content: `In the heart of the Niger Delta, Oloibiri Hospital provides critical healthcare services to over 3,600 patients annually and has safely delivered more than 34,000 babies since 2010. Yet for many in the community, access to healthcare remains out of reach. Despite being a private facility offering vital care, fees can range from ₦5,000 to ₦20,000 ($3 to $13) just for a consultation. Extended hospital stays may cost thousands of Naira, an impossible burden for residents earning an average annual income of $775 USD. Impact Mining covers Oloibiri Hospital's entire electricity bill. This not only reduces operational costs but directly increases access to care, enabling hundreds more patients to receive treatment each year.`,
    images: [
      {
        src: getImagePath('oloibiri_hospital_with_sign.jpg'),
        alt: 'Oloibiri Hospital exterior with sign',
        caption: 'An exterior view of the hospital'
      },
      {
        src: getImagePath('oloibiri_hospital_outside_image.jpg'),
        alt: 'Hospital compound exterior view',
        caption: 'An exterior view within the hospital compound'
      },
      {
        src: getImagePath('oloibiri_hospital_patients.jpg'),
        alt: 'Hospital exterior view',
        caption: 'An exterior view of the hospital'
      }
    ],
    partners: [
      {
        name: 'Compass Mining',
        logo: getImagePath('compass_mining.png'),
        role: 'Anchor Donor',
        description: 'World\'s premier bitcoin mining marketplace'
      },
      {
        name: 'Renewvia Energy Africa',
        logo: getImagePath('renewvia.png'),
        role: 'Development Partner',
        description: 'Global solar energy developer'
      }
    ],
    date: 'March 2024',
    author: 'Impact Mining Team'
  }
];

function VideoSection() {
  return (
    <div className="mt-8 space-y-4">
      <h4 className="font-semibold text-gray-800 mb-3">Project Video</h4>
      <div className="relative bg-gray-50 rounded-lg overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio container */}
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/fUiynwkU-is"
            title="Impact Mining Project Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

function PartnersSection({ partners }: { partners: Partner[] }) {
  console.log('PartnersSection called with:', partners);
  
  // Safety check in case partners is undefined
  if (!partners || partners.length === 0) {
    console.log('No partners found, partners:', partners);
    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-center text-gray-500">No partners data available</p>
      </div>
    );
  }

  console.log('Partners data:', partners); // Debug log

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h4 className="font-semibold text-gray-800 mb-6 text-center text-lg">Project Partners</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {partners.map((partner, index) => (
          <div key={index} className="text-center space-y-4 p-4 bg-black rounded-lg">
            <div className="flex justify-center">
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  console.log(`Failed to load image: ${partner.logo}`);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="space-y-1">
              <h5 className="font-semibold text-white">{partner.name}</h5>
              <p className="font-semibold text-white">{partner.role}</p>
              <p className="text-sm text-white">{partner.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageCarousel({ images }: { images: StoryImage[] }) {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImage(index);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 mb-3">Project Images</h4>
      
      <div className="relative bg-gray-50 rounded-lg overflow-hidden">
        {/* Main Image Display */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio container */}
          <img
            src={images[currentImage].src}
            alt={images[currentImage].alt}
            className="absolute top-0 left-0 w-full h-full object-contain bg-white"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          
          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentImage + 1} / {images.length}
            </div>
          )}
        </div>
        
        {/* Image Caption */}
        <div className="p-4 bg-white">
          <p className="text-sm text-gray-700 italic leading-relaxed">
            {images[currentImage].caption}
          </p>
        </div>
        
        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="flex justify-center space-x-2 pb-4 bg-white">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImage
                    ? 'bg-primary scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedStoryCard({ story }: { story: FeaturedStory }) {
  const [expanded, setExpanded] = useState(false);

  console.log('FeaturedStoryCard story:', story);
  console.log('Story partners:', story.partners);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary mb-2">{story.title}</h2>
            <p className="text-lg font-semibold text-secondary mb-2">{story.location}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {story.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {story.date}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-secondary">
            <Heart className="w-5 h-5 fill-current" />
            <span className="text-sm font-medium">Featured Story</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-lg max-w-none mb-6">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {expanded ? story.content : `${story.content.substring(0, 400)}...`}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
          >
            {expanded ? 'Show Less' : 'Read More'}
          </Button>
        </div>
        
        {expanded && (
          <div className="border-t pt-6">
            {story.id === 'ozuzu-nigeria' && <VideoSection />}
            <ImageCarousel images={story.images} />
            <PartnersSection partners={story.partners} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    body_md: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles (
            display_name
          )
        `)
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStory = async () => {
    if (!user || !newStory.title.trim() || !newStory.body_md.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          title: newStory.title.trim(),
          body_md: newStory.body_md.trim(),
          approved: false, // Stories need approval
        });

      if (error) throw error;

      setStoryModalOpen(false);
      setNewStory({ title: '', body_md: '' });
      alert('Story submitted successfully! It will be reviewed and published soon.');
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('Error submitting story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Impact Stories</h1>
            <p className="text-gray-600 mt-2">Real stories from our community</p>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="w-3/4 h-8 bg-gray-200 rounded mb-2"></div>
                <div className="w-1/2 h-6 bg-gray-200 rounded mb-2"></div>
                <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Impact Stories</h1>
          <p className="text-gray-600 mt-2">Real stories from our community making a difference</p>
        </div>
        <Button
          onClick={() => user ? setStoryModalOpen(true) : alert('Please sign in to share your story')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Share Your Story
        </Button>
      </div>

      {/* Featured Stories */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Featured Impact Stories</h2>
        {featuredStories.map((story) => (
          <FeaturedStoryCard key={story.id} story={story} />
        ))}
      </div>

      {/* Community Stories */}
      {stories.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Community Stories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card key={story.id} hover>
                <CardHeader>
                  <h3 className="text-xl font-semibold text-primary line-clamp-2">
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {story.profiles?.display_name || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(story.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 line-clamp-4">
                      {story.body_md.substring(0, 200)}...
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Heart className="w-4 h-4" />
                      <span>Inspiring</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Story Submission Modal */}
      <Modal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        title="Share Your Impact Story"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-gray-600">
            <p>Share your experience with our community. Your story helps inspire others and shows the real impact of our collective efforts.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Story Title
              </label>
              <input
                type="text"
                placeholder="Give your story a compelling title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={newStory.title}
                onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Story
              </label>
              <textarea
                rows={8}
                placeholder="Tell us about your experience, the impact you've witnessed, or how our projects have made a difference..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={newStory.body_md}
                onChange={(e) => setNewStory({ ...newStory, body_md: e.target.value })}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📝 Story Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Share personal experiences and authentic stories</li>
                <li>• Focus on the positive impact and outcomes</li>
                <li>• Be respectful and constructive in your writing</li>
                <li>• Stories will be reviewed before publication</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStoryModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitStory}
              loading={submitting}
              disabled={!newStory.title.trim() || !newStory.body_md.trim()}
              className="flex-1"
            >
              Submit Story
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}