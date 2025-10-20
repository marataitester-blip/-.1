import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import ImageRenderer from '../components/ImageRenderer';
import tarotDeck from '../constants/deck';

const About: React.FC = () => {
    const { t } = useTranslations();

    // Find the specific cards to display
    const foolCard = tarotDeck.find(card => card.id === 0);
    const temperanceCard = tarotDeck.find(card => card.id === 14);
    const heroCard = tarotDeck.find(card => card.id === 22);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold font-serif text-yellow-300">{t('aboutTitle')}</h1>
                <p className="mt-4 text-lg text-gray-300">Behind the scenes of creation.</p>
            </div>
            
            <div className="mt-12 text-left space-y-8 text-gray-300 leading-relaxed">
                <p>
                    The "Astral Hero" Tarot was born from a unique collaboration between human intuition and artificial intelligence. It began as a question: could we create a tool for self-reflection that was both timeless in its wisdom and truly modern in its creation?
                </p>
                <p>
                    Each image started as a concept, a feeling, an interpretation of the classic tarot archetypes. These ideas were then translated into complex prompts, given to an AI image generator. The AI acted as a co-creator, a digital muse, producing hundreds of variations. From this vast sea of possibilities, the final images were curated, refined, and imbued with symbolic meaning.
                </p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {foolCard && <ImageRenderer src={foolCard.imageUrl} alt={foolCard.name.en} className="rounded-lg shadow-lg aspect-[3/5]"/>}
                    {temperanceCard && <ImageRenderer src={temperanceCard.imageUrl} alt={temperanceCard.name.en} className="rounded-lg shadow-lg aspect-[3/5]"/>}
                    {heroCard && <ImageRenderer src={heroCard.imageUrl} alt={heroCard.name.en} className="rounded-lg shadow-lg aspect-[3/5]"/>}
                </div>
                <p className="text-center mt-4 text-lg text-yellow-300 font-serif">. Истории  ASTRAL HERO TAROT       2</p>
                <p>
                    This website itself is a continuation of that philosophy. The "Who are you in Tarot?" feature uses Gemini, another powerful AI, to create a deeply personal experience, bridging the gap between your own words and the universal language of the Arcana. It's a dialogue between you, the cards, and the cutting edge of technology.
                </p>
            </div>

            <div className="mt-16 text-center">
                <h2 className="text-3xl font-bold font-serif text-yellow-300">{t('aboutBlogTitle')}</h2>
                <p className="mt-2 text-lg text-gray-300">{t('aboutBlogSubtitle')}</p>
                <div className="mt-8 space-y-8 text-left">
                    <div className="p-6 bg-purple-900/30 rounded-lg border border-purple-700">
                        <h3 className="text-2xl font-serif text-yellow-400">Chapter 1: The Neon Hermit</h3>
                        <p className="text-sm text-gray-400 mt-1">Published: Week 1</p>
                        <p className="mt-4 text-gray-300 leading-relaxed">
                            The city hummed a song of a million lonely souls, and Leo was its most devoted listener. From his high-rise apartment, the streets below looked like circuits of light, each car a packet of data rushing towards an unknown destination. He was a modern hermit, his cave a server room, his wisdom found not in stars, but in streams of code. Tonight, however, the algorithm of his life was about to encounter a variable it couldn't predict...
                        </p>
                    </div>
                    <div className="p-6 bg-purple-900/30 rounded-lg border border-purple-700 opacity-60">
                        <h3 className="text-2xl font-serif text-yellow-400">Chapter 2: The Empress of the Rooftop Garden</h3>
                        <p className="text-sm text-gray-400 mt-1">Coming Soon: Week 2</p>
                        <p className="mt-4 text-gray-300 leading-relaxed">
                            A chance encounter leads Leo to a hidden oasis amidst the concrete jungle. A rooftop garden, teeming with life, tended by a woman who seems to grow more than just plants. She speaks of roots, of connection, of abundance in a city defined by scarcity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;