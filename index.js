const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Endpoint untuk scrape data anime berdasarkan slug
app.get('/anime/:slug', async (req, res) => {
  const slug = req.params.slug;
  const url = `https://nontonanimeid.cyou/anime/${slug}/`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $('.entry-title.cs').text().trim();
    const imgSrc = $('.poster img').attr('src');

    const extra = {};
    $('.extra span').each((index, element) => {
      const key = $(element).attr('class');
      const value = $(element).text().trim();
      extra[key] = value;
    });

    const latestEpisode = {
      title: $('.latestest .latestepisode').first().text().trim(),
      href: $('.latestest .latestepisode a').first().attr('href')
    };
    const firstEpisode = {
      title: $('.latestest .latestepisode').last().text().trim(),
      href: $('.latestest .latestepisode a').last().attr('href')
    };

    const infos = {};
    $('.bottomtitle .infoseries').each((index, element) => {
      const infoText = $(element).text().trim();
      const infoArr = infoText.split(':');
      const key = infoArr[0];
      const value = infoArr[1];
      infos[key] = value;
    });

    const description = $('.entry-content.seriesdesc p').text().trim();

    const episodes = [];
    $('.episodelist .misha_posts_wrap2 li').each((index, element) => {
      const episodeTitle = $(element).find('a').text().trim();
      const episodeDate = $(element).find('.t3').text().trim();
      const episodeUrl = $(element).find('a').attr('href');
      episodes.push({ episodeTitle, episodeDate, episodeUrl });
    });

    const animeData = {
      title,
      imgSrc,
      extra,
      latestEpisode,
      firstEpisode,
      infos,
      description,
      episodes
    };

    res.json(animeData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch anime data' });
  }
});

// Menjalankan server pada port tertentu
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
unning on port ${PORT}`);
});
      
