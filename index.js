const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const app = express();
const port = 3000;

// Route untuk informasi umum
app.get('/', async (req, res) => {
    res.json({
        author: 'GustiRafi',
        source: 'https://otakudesu.lol',
        endpoint: {
            'get anime terbaru': '/anime',
            'get complete anime': '/complete-anime',
            'get all genre': '/genre',
            'get anime by genre': '/genre/slug',
            'get detail anime': '/anime/slug',
            'stream anime': '/stream/eps',
            'search': '/search/nama',
        }
    });
});

// Route untuk mendapatkan detail anime dan episode berdasarkan slug
app.get('/anime/:slug', async (req, res) => {
    try {
        const animeDetail = await getAnimeDetail(req.params.slug);
        res.json(animeDetail);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch anime detail' });
    }
});

// Fungsi untuk fetch URL
async function fetchURL(url) {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    return $;
}

// Fungsi untuk mendapatkan detail anime
async function getAnimeDetail(slug) {
    const $ = await fetchURL(`https://nontonanimeid.cyou/anime/${slug}`);
    
    const title = $('.entry-title.cs').text();
    const imgSrc = $('.poster img').attr('src');
    
    const extra = {};
    $('.extra').find('span').each((index, element) => {
        extra[$(element).attr('class')] = $(element).text().trim();
    });
    
    const latestEpisode = {
        title: $('.latestepisode a').first().text(),
        href: $('.latestepisode a').first().attr('href')
    };
    const firstEpisode = {
        title: $('.latestepisode a').last().text(),
        href: $('.latestepisode a').last().attr('href')
    };
    
    const tags = [];
    $('.tagline a').each((index, element) => {
        tags.push($(element).text());
    });
    
    const infos = {};
    $('.infoseries').each((index, element) => {
        const infoText = $(element).text();
        const infoArr = infoText.split(':');
        const key = infoArr[0].trim();
        const value = infoArr[1].trim();
        infos[key] = value;
    });
    
    const description = $('.entry-content.seriesdesc p').text();

    // Mendapatkan detail episode
    const episodes = [];
    $('.episodelist .misha_posts_wrap2 li').each((index, element) => {
        const episodeTitle = $(element).find('a').text();
        const episodeDate = $(element).find('.t3').text();
        const episodeUrl = $(element).find('a').attr('href');
        episodes.push({ episodeTitle, episodeDate, episodeUrl });
    });

    return {
        title,
        imgSrc,
        extra,
        latestEpisode,
        firstEpisode,
        tags,
        infos,
        description,
        episodes  // Menambahkan detail episode ke dalam respons
    };
}

// Jalankan server
app.listen(port, () => {
    console.log(`Running http://localhost:${port}`);
});
