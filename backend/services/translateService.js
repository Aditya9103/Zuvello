import translate from '@vitalets/google-translate-api';

/**
 * Translate text to target language using Google Translate
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'hi', 'ta', 'te')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLang) => {
    try {
        if (!text || !targetLang) {
            throw new Error('Text and target language are required');
        }

        // If target language is English, return original text
        if (targetLang === 'en') {
            return text;
        }

        const result = await translate(text, { to: targetLang });
        return result.text;
    } catch (error) {
        console.error(`Translation error for language ${targetLang}:`, error.message);
        // Return original text if translation fails
        return text;
    }
};

/**
 * Translate entire blog object (title, excerpt, content)
 * @param {Object} blog - Blog object with title, excerpt, content
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} - Translated blog object
 */
export const translateBlog = async (blog, targetLang) => {
    try {
        console.log(`🌐 Translating blog "${blog.title}" to ${targetLang}...`);

        // Translate all fields in parallel for better performance
        const [translatedTitle, translatedExcerpt, translatedContent] = await Promise.all([
            translateText(blog.title, targetLang),
            translateText(blog.excerpt, targetLang),
            translateText(blog.content, targetLang)
        ]);

        console.log(`✅ Translation completed for ${targetLang}`);

        return {
            title: translatedTitle,
            excerpt: translatedExcerpt,
            content: translatedContent,
            translatedAt: new Date()
        };
    } catch (error) {
        console.error(`Blog translation error for ${targetLang}:`, error.message);
        // Return original content if translation fails
        return {
            title: blog.title,
            excerpt: blog.excerpt,
            content: blog.content,
            translatedAt: new Date()
        };
    }
};
