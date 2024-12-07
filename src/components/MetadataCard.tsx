import React, { useState } from 'react';
import { Text, Author } from '../types';

interface MetadataCardProps {
    text: Text;
    author?: Author | null;
    currentVolume?: string;
}

const MetadataCard: React.FC<MetadataCardProps> = ({ text, author, currentVolume }) => {
    const [isTextExpanded, setIsTextExpanded] = useState(false);
    const [isAuthorExpanded, setIsAuthorExpanded] = useState(false);

    return (
        <div className="metadata-cards">
            <div className="metadata-section">
                <h3
                    onClick={() => setIsTextExpanded(!isTextExpanded)}
                    className={isTextExpanded ? 'header-border-bottom' : ''}
                >
                    <span className="arrow">{isTextExpanded ? '▼' : '▶'}</span>
                    Text Metadata
                </h3>
                {isTextExpanded && (
                    <div className="metadata-grid">
                        <div>
                            <p><strong>Title (AR):</strong> {text.title_ar}</p>
                            <p><strong>Title (LAT):</strong> {text.title_lat}</p>
                            <p><strong>Collection:</strong> {text.collection}</p>
                        </div>
                        <div>
                            <p><strong>Text ID:</strong> {text.text_id}</p>
                            <p><strong>URI:</strong> {text.text_uri}</p>
                            <p><strong>Tags:</strong> {text.tags?.join(', ')}</p>
                        </div>
                        <div>
                            <p><strong>Length:</strong> {text.tok_len} tokens</p>
                            <p><strong>Pages:</strong> {text.pg_len}</p>
                            {currentVolume && <p><strong>Volume:</strong> {currentVolume}</p>}
                        </div>
                    </div>
                )}
            </div>

            {author && (
                <div className="metadata-section">
                    <h3
                        onClick={() => setIsAuthorExpanded(!isAuthorExpanded)}
                        className={isAuthorExpanded ? 'header-border-bottom' : ''}
                    >
                        <span className="arrow">{isAuthorExpanded ? '▼' : '▶'}</span>
                        Author Metadata
                    </h3>
                    {isAuthorExpanded && (
                        <div className="metadata-grid">
                            <div>
                                <p><strong>Name (AR):</strong> {author.au_ar}</p>
                                <p><strong>Short Name (AR):</strong> {author.au_sh_ar}</p>
                            </div>
                            <div>
                                <p><strong>Name (LAT):</strong> {author.au_lat}</p>
                                <p><strong>Short Name (LAT):</strong> {author.au_sh_lat}</p>
                            </div>
                            <div>
                                <p><strong>Death Date:</strong> {author.au_death}</p>
                                <p><strong>Author ID:</strong> {author.au_id}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MetadataCard;