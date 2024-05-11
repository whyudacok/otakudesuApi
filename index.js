const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

async function scrapeAnimeData(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const title = $('h1.entry-title.cs').text().trim();
        const imgSrc = $('div.poster img').attr('src');

        const extra = {};
        $('div.extra').find('span').each((index, element) => {
            extra[$(element).attr('class')] = $(element).text().trim();
        });

        const latestEpisode = {
            title: $('div.latestheader:contains("Episode Terakhir")').next().text().trim(),
            href: $('div.latestheader:contains("Episode Terakhir")').next().find('a').attr('href')
        };
        const firstEpisode = {
            title: $('div.latestheader:contains("Episode Pertama")').next().text().trim(),
            href: $('div.latestheader:contains("Episode Pertama")').next().find('a').attr('href')
        };

        const infoseries = {};
        $('div.bottomtitle').each((index, element) => {
            const key = $(element).find('span.infoseries').text().replace(':', '').trim();
            const value = $(element).find('span.infoseries').next().text().trim();
            infoseries[key] = value;
        });

        const seriesdesc = $('div.entry-content.seriesdesc p').text().trim();

        const episodeList = [];
        $('div.episodelist ul.misha_posts_wrap2 li').each((index, element) => {
            const episodeTitle = $(element).find('span.t1 a').text().trim();
            const episodeDate = $(element).find('span.t3').text().trim();
            const episodeUrl = $(element).find('span.t1 a').attr('href');
            episodeList.push({ episodeTitle, episodeDate, episodeUrl });
        });

        const animeData = {
            title,
            imgSrc,
            extra,
            latestEpisode,
            firstEpisode,
            infoseries,
            seriesdesc,
            episodeList
        };

        return animeData;
    } catch (error) {
        console.error(error);
        return { error: 'Failed to fetch anime data' };
    }
}

app.get('/anime/:slug', async (req, res) => {
    const { slug } = req.params;
    const url = `https://nontonanimeid.cyou/anime/${slug}/`;

    const animeData = await scrapeAnimeData(url);
    res.json(animeData);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
