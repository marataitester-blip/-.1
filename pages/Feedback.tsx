
import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Review } from '../types';

const initialReviews: Review[] = [
    {
        id: 1,
        name: 'Elena P.',
        date: '2024-07-15',
        text: 'This tarot deck is absolutely stunning! The AI-generated artwork is both unique and deeply insightful. The "Who are you in Tarot?" feature was shockingly accurate. Highly recommend!',
        reply: {
            text: 'Thank you so much for your kind words, Elena! We are thrilled that the deck and the quiz resonated with you. The goal was to blend ancient wisdom with modern magic, and it sounds like it worked for you.',
            date: '2024-07-16',
        }
    },
    {
        id: 2,
        name: 'Mark S.',
        date: '2024-07-18',
        text: 'A very interesting and modern take on Tarot. The encyclopedia is a fantastic resource for learning. I spend hours just browsing the cards.',
    }
];


const Feedback: React.FC = () => {
    const { t } = useTranslations();
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [newName, setNewName] = useState('');
    const [newText, setNewText] = useState('');
    
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newText.trim()) return;

        const newReview: Review = {
            id: Date.now(),
            name: newName,
            text: newText,
            date: new Date().toISOString().split('T')[0],
        };

        setReviews([newReview, ...reviews]);
        setNewName('');
        setNewText('');
    };
    
    const handleReplySubmit = (reviewId: number) => {
        if (!replyText.trim()) return;

        setReviews(reviews.map(review => {
            if (review.id === reviewId) {
                return {
                    ...review,
                    reply: {
                        text: replyText,
                        date: new Date().toISOString().split('T')[0]
                    }
                };
            }
            return review;
        }));

        setReplyingTo(null);
        setReplyText('');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold font-serif">{t('feedbackTitle')}</h1>
                <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl mx-auto">{t('feedbackSubtitle')}</p>
            </div>

            <div className="mt-12 p-8 bg-[var(--card-bg)] rounded-lg border border-[var(--accent)]/20">
                <h2 className="text-3xl font-serif mb-6">{t('feedbackFormTitle')}</h2>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[var(--muted)]">{t('feedbackNameLabel')}</label>
                        <input
                            type="text"
                            id="name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder={t('feedbackNamePlaceholder')}
                            className="mt-1 w-full px-4 py-2 bg-black/30 border border-[var(--accent)]/30 rounded-md text-white placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="feedback" className="block text-sm font-medium text-[var(--muted)]">{t('feedbackTextLabel')}</label>
                        <textarea
                            id="feedback"
                            rows={5}
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder={t('feedbackTextPlaceholder')}
                            className="mt-1 w-full p-4 bg-black/30 border border-[var(--accent)]/30 rounded-md text-white placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            required
                        />
                    </div>
                    <div className="text-right">
                        <button
                          type="submit"
                          className="inline-block bg-[var(--accent)] text-[var(--bg)] font-bold py-2 px-6 rounded-full text-base hover:bg-[#d8b88c] transition-transform transform hover:scale-105 duration-300 disabled:opacity-50"
                          disabled={!newName.trim() || !newText.trim()}
                        >
                          {t('feedbackSubmit')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-12 space-y-8">
                {reviews.map(review => (
                    <div key={review.id} className="p-6 bg-[var(--card-bg)] rounded-lg border border-[var(--accent)]/20 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-xl text-[var(--accent)] font-serif">{review.name}</p>
                            <p className="text-sm text-[var(--muted)]/70">{review.date}</p>
                        </div>
                        <p className="mt-4 text-[var(--fg)] leading-relaxed">{review.text}</p>
                        
                        {review.reply ? (
                            <div className="mt-4 pt-4 border-t border-[var(--accent)]/20 pl-4 border-l-2 border-[var(--accent)]/20">
                                <p className="font-semibold text-[var(--accent)] text-md">{t('feedbackAdminReply')}</p>
                                <p className="text-[var(--muted)] italic mt-2">{review.reply.text}</p>
                                <p className="text-xs text-[var(--muted)]/50 text-right mt-2">{review.reply.date}</p>
                            </div>
                        ) : (
                            replyingTo !== review.id ? (
                                <div className="text-right mt-4">
                                    <button onClick={() => setReplyingTo(review.id)} className="text-sm text-[var(--accent)] hover:underline">{t('feedbackReplyButton')}</button>
                                </div>
                            ) : (
                                <div className="mt-4 pt-4 border-t border-[var(--accent)]/20">
                                    <textarea
                                        rows={3}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={t('feedbackReplyPlaceholder')}
                                        className="w-full p-2 bg-black/30 border border-[var(--accent)]/30 rounded-md text-white placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => setReplyingTo(null)} className="text-sm text-[var(--muted)] hover:text-white px-3 py-1 rounded-md">{t('feedbackCancelButton')}</button>

                                        <button onClick={() => handleReplySubmit(review.id)} className="text-sm bg-[var(--accent)] text-[var(--bg)] font-bold px-3 py-1 rounded-full hover:bg-[#d8b88c]">{t('feedbackSubmitReplyButton')}</button>

                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feedback;