const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

async function scrapeAnimeInfo(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Check if the HTML element exists
        if (!$('.entry-title.cs').length) {
            throw new Error('Anime data not found');
        }

        // Scraping logic
        const title = $('.entry-title.cs').text();
        const imgSrc = $('.poster img').attr('src');
        const status = $('.statusseries').text();
        const duration = $('.durasiseries').text();
        const rating = $('.nilaiseries').text();
        const aired = $('.infoseries:contains("Aired:")').text().replace('Aired: ', '');
        const genres = [];
        $('.tagline a').each((index, element) => {
            genres.push($(element).text());
        });

        const lastEpisode = {
            title: $('.latestest .latestheader').eq(0).text(),
            link: $('.latestest .latestepisode a').eq(0).attr('href')
        };

        const firstEpisode = {
            title: $('.latestest .latestheader').eq(1).text(),
            link: $('.latestest .latestepisode a').eq(1).attr('href')
        };

        const synopsis = $('.entry-content.seriesdesc p').text();

        const episodes = [];
        $('.episodelist ul li').each((index, element) => {
            const episodeTitle = $(element).find('.t1 a').text();
            const episodeDate = $(element).find('.t3').text();
            const episodeLink = $(element).find('.t1 a').attr('href');
            episodes.push({ title: episodeTitle, date: episodeDate, link: episodeLink });
        });

        // Construct and return animeData object
        const animeData = {
            title,
            imgSrc,
            status,
            duration,
            rating,
            aired,
            genres,
            lastEpisode,
            firstEpisode,
            synopsis,
            episodes
        }; // Modify according to your scraping logic
        return animeData;
    } catch (error) {
        console.error('Failed to fetch anime data:', error);
        throw error;
    }
}

app.get('/anime/:slug', async (req, res) => {
    const { slug } = req.params;
    const url = `https://nontonanimeid.cyou/anime/${slug}`;

    try {
        const animeData = await scrapeAnimeInfo(url);
        res.json(animeData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch anime data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
