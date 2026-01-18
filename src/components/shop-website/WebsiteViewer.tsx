'use client';

import React from 'react';
import { ShopWebsite, User } from '@/types';
import { SimpleTemplate } from './templates/SimpleTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { ColorfulTemplate } from './templates/ColorfulTemplate';
import { ElegantTemplate } from './templates/ElegantTemplate';

interface WebsiteViewerProps {
    website: ShopWebsite;
    owner: User;
}

export const WebsiteViewer: React.FC<WebsiteViewerProps> = ({ website, owner }) => {
    const renderTemplate = () => {
        const props = { website, owner };

        switch (website.templateId) {
            case 'simple':
                return <SimpleTemplate {...props} />;
            case 'modern':
                return <ModernTemplate {...props} />;
            case 'colorful':
                return <ColorfulTemplate {...props} />;
            case 'elegant':
                return <ElegantTemplate {...props} />;
            default:
                return <SimpleTemplate {...props} />;
        }
    };

    return <div>{renderTemplate()}</div>;
};
