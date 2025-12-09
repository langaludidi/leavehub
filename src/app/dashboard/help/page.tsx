'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen, Search, Rocket, Calendar, Sparkles, FileText,
  Scale, AlertCircle, ChevronRight, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { categories, articles, searchArticles } from '@/lib/help-center/articles';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof articles>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setSearchResults(searchArticles(query));
    } else {
      setSearchResults([]);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Rocket, Calendar, Sparkles, FileText, Scale, AlertCircle
    };
    const Icon = icons[iconName] || BookOpen;
    return <Icon className="w-6 h-6" />;
  };

  const getCategoryArticles = (categoryId: string) => {
    return articles.filter(a => a.category === categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-teal-600" />
            <h1 className="text-4xl font-bold text-gray-900">Help Center</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Find answers, learn features, and get the most out of LeaveHub
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card className="mt-4 max-h-96 overflow-y-auto">
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Found {searchResults.length} article{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2">
                    {searchResults.map((article) => (
                      <Link
                        key={article.id}
                        href={`/dashboard/help/${article.id}`}
                        className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <h4 className="font-medium text-gray-900">{article.title}</h4>
                        <p className="text-sm text-gray-500 capitalize">
                          {categories.find(c => c.id === article.category)?.name}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => {
            const articleCount = getCategoryArticles(category.id).length;
            return (
              <Card
                key={category.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <Link href={`/dashboard/help/category/${category.id}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 text-teal-600">
                      {getIcon(category.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-teal-600">
                          {articleCount} article{articleCount !== 1 ? 's' : ''}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Popular Articles */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.slice(0, 6).map((article) => (
              <Link
                key={article.id}
                href={`/dashboard/help/${article.id}`}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <FileText className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 group-hover:text-teal-600">
                    {article.title}
                  </h4>
                  <p className="text-sm text-gray-500 capitalize">
                    {categories.find(c => c.id === article.category)?.name}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
              </Link>
            ))}
          </div>
        </Card>

        {/* Contact Support */}
        <Card className="p-8 bg-gradient-to-r from-teal-500 to-blue-600 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
            <p className="text-teal-50 mb-6">
              Our support team is here to help you with any questions
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-100"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Email Support
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Contact HR
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
