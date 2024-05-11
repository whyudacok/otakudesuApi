const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();

app.get('/anime/:slug', async (req, res) => {
    const slug = req.params.slug;
    const animeUrl = `https://nontonanimeid.cyou/anime/${slug}/`;

    try {
        const animeData = await scrapeAnimeInfo(animeUrl);
        res.json(animeData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch anime data' });
    }
});

async function scrapeAnimeInfo(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const title = $('.entry-title.cs').text();
        const imgSrc = $('.poster img').attr('src');

        const extra = {};
        $('.extra span').each((index, element) => {
            extra[$(element).attr('class')] = $(element).text().trim();
        });

        const latestEpisode = {
            title: $('.latestepisode').first().text().trim(),
            href: $('.latestepisode a').first().attr('href')
        };
        const firstEpisode = {
            title: $('.latestepisode').last().text().trim(),
            href: $('.latestepisode a').last().attr('href')
        };

        const infoSeries = {};
        $('.infoseries').each((index, element) => {
            const key = $(element).find('b').text().replace(':', '').trim();
            const value = $(element).text().replace(key + ':', '').trim();
            infoSeries[key] = value;
        });

        const seriesDescription = $('.seriesdesc p').text().trim();

        const episodeList = [];
        $('.misha_posts_wrap2 li').each((index, element) => {
            const episodeTitle = $(element).find('.t1 a').text().trim();
            const episodeDate = $(element).find('.t3').text().trim();
            const episodeUrl = $(element).find('.t1 a').attr('href');
            episodeList.push({ title: episodeTitle, date: episodeDate, url: episodeUrl });
        });

        const animeData = {
            title: title,
            imgSrc: imgSrc,
            extra: extra,
            latestEpisode: latestEpisode,
            firstEpisode: firstEpisode,
            infoSeries: infoSeries,
            seriesDescription: seriesDescription,
            episodeList: episodeList
        };

        return animeData;
    } catch (error) {
        console.error('Failed to fetch anime data:', error);
        throw error;
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
