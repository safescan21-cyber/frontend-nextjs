'use client';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from '../../shell/router';
import axios from 'axios';
import { Calendar, User, ArrowLeft, FileText } from 'lucide-react';
// If this file is directly in src/components/pages/, this path is right.
// Add one more "../" for each extra folder level.
import getBaseUrl from '../../utlis/baseURL';
import Seo from '../Seo';

// A real press release is an object with a title
const asPress = (data) => (data && typeof data === 'object' && data.title ? data : null);

// initial: the article as the server fetched it (app/[locale]/press/[id])
const PublicPressDetail = ({ initial }) => {
  const { id } = useParams();
  const [press, setPress] = useState(() => asPress(initial));
  const [loading, setLoading] = useState(!asPress(initial));

  useEffect(() => {
    if (asPress(initial)?._id === id) return;
    const load = async () => {
      try {
        const res = await axios.get(`${getBaseUrl()}/api/press/${id}`, {
          withCredentials: true,
        });
        setPress(asPress(res.data?.data));
      } catch (err) {
        console.error(err);
        setPress(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="p-6 pt-8 text-center">Loading...</div>;
  if (!press) {
    return (
      <div className="p-6 pt-8 text-center text-red-500">
        <Seo title="Press release not found" noindex />
        Press release not found
      </div>
    );
  }

  const media = press.media || [];

  // SEO: own title/description/image + Article structured data for Google News & search
  const plain = String(press.summary || press.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const image = media.find((m) => m.type === 'image')?.url;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: String(press.title).slice(0, 110),
    description: plain.slice(0, 300),
    ...(image && { image: [image] }),
    datePublished: press.publishedDate,
    dateModified: press.updatedAt || press.publishedDate,
    author: { '@type': 'Organization', name: 'Food Pharma Machinery', url: 'https://www.foodpharmamachinery.com/' },
    publisher: {
      '@type': 'Organization',
      name: 'Food Pharma Machinery',
      logo: { '@type': 'ImageObject', url: 'https://www.foodpharmamachinery.com/favicon-192.png' },
    },
    mainEntityOfPage: `https://www.foodpharmamachinery.com/press/${press._id}`,
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <Seo
        title={press.title}
        description={plain.slice(0, 160)}
        path={`/press/${press._id}`}
        image={image}
        type="article"
        jsonLd={articleJsonLd}
      />
      <Link to="/press" className="inline-flex items-center text-blue-600 hover:underline mb-4">
        <ArrowLeft size={18} className="mr-1" /> Back to all releases
      </Link>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-3xl font-bold">{press.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar size={16} /> {new Date(press.publishedDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <User size={16} /> {press.author?.name || 'Admin'}
          </span>
        </div>
        {press.summary && (
          <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-400 italic text-gray-700">
            {press.summary}
          </div>
        )}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: (press.content || '').replace(/\n/g, '<br/>') }}
        />
        {media.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Media</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((m) => (
                <div key={m.public_id} className="border rounded overflow-hidden bg-gray-50">
                  {m.type === 'image' && (
                    <img src={m.url} alt={m.caption || 'media'} className="w-full h-40 object-cover" />
                  )}
                  {m.type === 'video' && (
                    <video src={m.url} controls className="w-full h-40 object-cover" />
                  )}
                  {m.type === 'document' && (
                    <div className="p-4 flex items-center gap-2">
                      <FileText size={24} className="text-orange-600" />
                      <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                        {m.caption || 'Document'}
                      </a>
                    </div>
                  )}
                  {m.caption && <p className="text-xs text-gray-500 p-1 truncate">{m.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPressDetail;