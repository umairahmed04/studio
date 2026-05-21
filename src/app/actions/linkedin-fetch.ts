'use server';

/**
 * @fileOverview Server action to attempt fetching public LinkedIn metadata.
 */

export async function fetchLinkedInMetadata(url: string) {
  if (!url || !url.includes('linkedin.com/in/')) {
    return { success: false, message: 'Invalid LinkedIn URL' };
  }

  try {
    // Attempt to fetch the public page. 
    // Note: LinkedIn aggressively blocks scraping, so this usually only gets OG meta tags.
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error('Failed to fetch');

    const html = await response.text();

    // Extract basic OG tags for a "live" feel
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || "";
    const ogDesc = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] || "";
    
    // Clean up entities
    const cleanTitle = ogTitle.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    const cleanDesc = ogDesc.replace(/&amp;/g, '&').replace(/&quot;/g, '"');

    if (!cleanTitle && !cleanDesc) {
      return { success: false, message: 'Could not extract profile data automatically.' };
    }

    return {
      success: true,
      data: {
        headline: cleanTitle.split('|')[0]?.trim() || "",
        summary: cleanDesc,
        fullText: `${cleanTitle}\n\n${cleanDesc}`
      }
    };
  } catch (error) {
    console.error('LinkedIn fetch error:', error);
    return { success: false, message: 'Connection restricted by LinkedIn. Please paste manually.' };
  }
}
