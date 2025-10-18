import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import ImageRenderer from '../components/ImageRenderer';

const About: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-yellow-300">{t('aboutTitle')}</h1>
            <p className="mt-4 text-lg text-gray-300">Behind the scenes of creation.</p>
            <div className="mt-12 text-left space-y-8 text-gray-300 leading-relaxed">
                <p>
                    The "Astral Hero" Tarot was born from a unique collaboration between human intuition and artificial intelligence. It began as a question: could we create a tool for self-reflection that was both timeless in its wisdom and truly modern in its creation?
                </p>
                <p>
                    Each image started as a concept, a feeling, an interpretation of the classic tarot archetypes. These ideas were then translated into complex prompts, given to an AI image generator. The AI acted as a co-creator, a digital muse, producing hundreds of variations. From this vast sea of possibilities, the final images were curated, refined, and imbued with symbolic meaning.
                </p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ImageRenderer src="https://picsum.photos/seed/tarot1/400/600" alt="Sketch 1" className="rounded-lg shadow-lg aspect-[2/3]"/>
                    <ImageRenderer src="https://picsum.photos/seed/tarot2/400/600" alt="Sketch 2" className="rounded-lg shadow-lg aspect-[2/3]"/>
                    <ImageRenderer src="https://picsum.photos/seed/tarot3/400/600" alt="Sketch 3" className="rounded-lg shadow-lg aspect-[2/3]"/>
                </div>
                <p>
                    This website itself is a continuation of that philosophy. The "Who are you in Tarot?" feature uses Gemini, another powerful AI, to create a deeply personal experience, bridging the gap between your own words and the universal language of the Arcana. It's a dialogue between you, the cards, and the cutting edge of technology.
                </p>
            </div>
        </div>
    );
};

export default About;