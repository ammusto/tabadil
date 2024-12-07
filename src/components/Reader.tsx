import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useMetadata } from '../contexts/MetadataContext';
import LoadingGif from './LoadingGif';
import ReaderPagination from './ReaderPagination';
import MetadataCard from './MetadataCard';

import './Reader.css';

interface Page {
    page_id: number;
    page_num: string;
    page_content: string;
    vol: string;
}

interface ReaderProps {
    pageRange?: number;
    className?: string;
    showMetadata?: boolean;
    enableKeyboardNav?: boolean;
    onPageChange?: (pageNum: string, pageId: number) => void;
    highlightColor?: string;
    showPagination?: boolean;
}

const Reader: React.FC<ReaderProps> = ({
    pageRange = 10,
    className = '',
    showMetadata = true,
    enableKeyboardNav = true,
    onPageChange,
    highlightColor = 'red',
    showPagination = true
}) => {
    const { textId, pageId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { texts, authors, isLoading: isMetadataLoading } = useMetadata();
    const [pages, setPages] = useState<Page[]>([]);
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
    const [isLoadingPages, setIsLoadingPages] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false)
    const { text, author } = useMemo(() => {
        if (!textId || !texts.length) return { text: null, author: null };
        const foundText = texts.find(t => t.text_id === parseInt(textId));
        const foundAuthor = foundText ? authors.find(a => a.au_id === foundText.au_ids[0]) : null;
        return { text: foundText, author: foundAuthor };
    }, [textId, texts, authors]);

    const highlights = useMemo(() =>
        searchParams.get('highlights')?.split(',').filter(Boolean) || [],
        [searchParams]
    );

    // Single fetch on mount
    useEffect(() => {
        const fetchPages = async () => {

            if (!textId || !pageId || !text) return;

            setIsLoadingPages(true);
            try {
                const currentPageId = parseInt(pageId);
                const size = (pageRange * 2) + 1;
                const from = Math.max(0, currentPageId - pageRange);

                const query = {
                    query: {
                        bool: {
                            must: [
                                { term: { text_id: parseInt(textId) } }
                            ]
                        }
                    },
                    sort: [{ page_id: 'asc' }],
                    size: size,
                    from: from
                };

                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/${process.env.REACT_APP_API_INDEX}/_search`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Basic ' + btoa(`${process.env.REACT_APP_API_USER}:${process.env.REACT_APP_API_PASS}`),
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(query)
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch pages');
                }

                const data = await response.json();
                const fetchedPages: Page[] = data.hits.hits.map((hit: any) => hit._source);

                if (fetchedPages.length === 0) {
                    throw new Error('No pages found');
                }

                setPages(fetchedPages);
                const targetIndex = fetchedPages.findIndex(page => page.page_id === currentPageId);
                setCurrentPageIndex(Math.max(0, targetIndex));

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load page');
            } finally {
                setIsLoadingPages(false);
            }

        };

        if (!isMetadataLoading && text && !hasSearched) {
            fetchPages();
            setHasSearched(true);
        }
    }, [textId, pageId, text, pageRange, isMetadataLoading, hasSearched]); 

    const handlePageChange = useCallback((newIndex: number) => {
        if (newIndex < 1 || newIndex > pages.length) return;

        const actualIndex = newIndex - 1;
        const targetPage = pages[actualIndex];
        if (!targetPage) return;

        setCurrentPageIndex(actualIndex);

        // Update URL without triggering a re-fetch
        navigate(
            `/reader/${textId}/${targetPage.page_id}?highlights=${searchParams.get('highlights') || ''}`,
            { replace: true }
        );

        onPageChange?.(targetPage.page_num, targetPage.page_id);
    }, [pages, textId, searchParams, navigate, onPageChange]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enableKeyboardNav) return;

        if (e.key === 'ArrowLeft' && currentPageIndex > 0) {
            handlePageChange(currentPageIndex);
        } else if (e.key === 'ArrowRight' && currentPageIndex < pages.length - 1) {
            handlePageChange(currentPageIndex + 2);
        }
    }, [enableKeyboardNav, currentPageIndex, pages.length, handlePageChange]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const highlightPatterns = useMemo(() =>
        highlights.map(highlight => {
            return new RegExp(highlight, 'g');
        }),
        [highlights]
    );

    const highlightText = useCallback((text: string): string => {
        let highlighted = text;

        highlightPatterns.forEach(pattern => {
            const matches = [...text.matchAll(pattern)];
            matches.reverse().forEach(match => {
                if (match.index !== undefined) {
                    const start = match.index;
                    const end = start + match[0].length;
                    highlighted =
                        highlighted.slice(0, start) +
                        `<span class="highlight" style="color: ${highlightColor}">${highlighted.slice(start, end)}</span>` +
                        highlighted.slice(end);
                }
            });
        });

        return highlighted;
    }, [highlightPatterns, highlightColor]);

    if (isMetadataLoading || isLoadingPages) {
        return <LoadingGif />;
    }

    if (error) return <div className="error">{error}</div>;
    if (!text) return <div className="error">Text not found</div>;
    if (!pages.length) return <div className="error">No pages found</div>;

    const currentPage = pages[currentPageIndex];
    if (!currentPage) return <div className="error">Page not found</div>;

    return (
        <div className={`reader-container ${className}`.trim()}>
            {showMetadata && (
                <MetadataCard
                    text={text}
                    author={author}
                    currentVolume={currentPage.vol}
                    expanded={false}
                />
            )}
            <div className="reader-content" dir="rtl">
                <div
                    dangerouslySetInnerHTML={{
                        __html: highlightText(currentPage.page_content)
                    }}
                />
            </div>

            {showPagination && (
                <div className="pagination-container">
                    <ReaderPagination
                        realPage={currentPage.page_num}
                        currentPage={currentPageIndex + 1}
                        totalPages={pages.length}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default Reader;