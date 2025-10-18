
import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

const Blog: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-yellow-300 text-center">{t('blogTitle')}</h1>
            <p className="mt-4 text-lg text-gray-300 text-center">A story unfolds, one chapter at a time.</p>
            <div className="mt-12 space-y-12">
                <div className="p-6 bg-purple-900/30 rounded-lg border border-purple-700">
                    <h2 className="text-3xl font-serif text-yellow-400">Chapter 1: The Neon Hermit</h2>
                    <p className="text-sm text-gray-400 mt-1">Published: Week 1</p>
                    <p className="mt-4 text-gray-300 leading-relaxed">
                        The city hummed a song of a million lonely souls, and Leo was its most devoted listener. From his high-rise apartment, the streets below looked like circuits of light, each car a packet of data rushing towards an unknown destination. He was a modern hermit, his cave a server room, his wisdom found not in stars, but in streams of code. Tonight, however, the algorithm of his life was about to encounter a variable it couldn't predict...
                    </p>
                </div>
                <div className="p-6 bg-purple-900/30 rounded-lg border border-purple-700 opacity-60">
                    <h2 className="text-3xl font-serif text-yellow-400">Chapter 2: The Empress of the Rooftop Garden</h2>
                    <p className="text-sm text-gray-400 mt-1">Coming Soon: Week 2</p>
                    <p className="mt-4 text-gray-300 leading-relaxed">
                        A chance encounter leads Leo to a hidden oasis amidst the concrete jungle. A rooftop garden, teeming with life, tended by a woman who seems to grow more than just plants. She speaks of roots, of connection, of abundance in a city defined by scarcity.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Blog;
