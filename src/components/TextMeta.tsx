import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useMetadata } from '../contexts/MetadataContext';
import MetadataCard from './MetadataCard';
import LoadingGif from './LoadingGif';

const TextMetadataPage: React.FC = () => {
    const { textId } = useParams();
    const { texts, authors, isLoading } = useMetadata();

    const { text, author } = useMemo(() => {
        if (!textId || !texts.length) return { text: null, author: null };
        const foundText = texts.find(t => t.text_id === parseInt(textId));
        const foundAuthor = foundText ? authors.find(a => a.au_id === foundText.au_ids[0]) : null;
        return { text: foundText, author: foundAuthor };
    }, [textId, texts, authors]);

    if (isLoading) {
        return (
            <div className="container">
                <div className="search-container center">
                    <p>Loading Text Metadata</p>
                    <LoadingGif />
                </div>
            </div>
        );
    }

    if (!text) {
        return (
            <div className="container">
                <div className="error">Text not found</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="metadata-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <MetadataCard
                    text={text}
                    author={author}
                    expanded={true}
                />

            </div>
        </div>
    );
};

export default TextMetadataPage;