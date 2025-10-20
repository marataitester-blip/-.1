
import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { TelegramIcon, InstagramIcon, FacebookIcon, VkIcon, TiktokIcon, YoutubeIcon, WhatsappIcon, ViberIcon } from '../components/SocialIcons';

const socialLinks = [
  { name: 'Telegram', href: 'https://t.me/+y7Inf371g7w0NzMy', Icon: TelegramIcon },
  { name: 'Instagram', href: 'https://www.instagram.com', Icon: InstagramIcon },
  { name: 'Facebook', href: 'https://www.facebook.com', Icon: FacebookIcon },
  { name: 'ВКонтакте', href: 'https://vk.com', Icon: VkIcon },
  { name: 'TikTok', href: 'https://www.tiktok.com', Icon: TiktokIcon },
  { name: 'YouTube', href: 'https://www.youtube.com', Icon: YoutubeIcon },
  { name: 'WhatsApp', href: 'https://wa.me/yournumber', Icon: WhatsappIcon },
  { name: 'Viber', href: 'viber://chat?number=yournumber', Icon: ViberIcon },
];

const Community: React.FC = () => {
  const { t } = useTranslations();

  return (
    <div className="max-w-3xl mx-auto text-center py-8">
      <h1 className="text-4xl md:text-5xl font-bold font-serif text-yellow-300">{t('communityTitle')}</h1>
      <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">{t('communitySubtitle')}</p>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {socialLinks.map(({ name, href, Icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center p-6 bg-purple-900/30 rounded-lg border border-purple-700 hover:bg-purple-800/50 hover:border-yellow-400 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-yellow-500/10"
          >
            <Icon className="w-12 h-12 text-gray-300 group-hover:text-yellow-300 transition-colors" />
            <span className="mt-4 text-lg font-semibold text-white">{name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Community;
