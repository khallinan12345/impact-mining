import React, { useState, useEffect } from 'react';
import { Plus, Heart, Calendar, User } from 'lucide-react';
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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

      {/* Stories Grid */}
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

      {stories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No stories yet</h3>
          <p className="text-gray-500 mb-4">Be the first to share your impact story with the community!</p>
          <Button onClick={() => user ? setStoryModalOpen(true) : alert('Please sign in to share your story')}>
            <Plus className="w-4 h-4 mr-2" />
            Share Your Story
          </Button>
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