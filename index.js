const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();

app.get('/episodeterbaru', async (req, res) => {
  try {
    const response = await axios.get('https://nontonanimeid.cyou/anime/kaijuu-8-gou/');
    const $ = cheerio.load(response.data);
    
    const title = $('.entry-title.cs').text().trim();
    const imgSrc = $('.poster img').attr('src').trim();
    
    const extra = {};
    $('.extra').find('span').each((index, element) => {
      extra[$(element).attr('class')] = $(element).text().trim();
    });
    
    const latestEpisodeTitle = $('.latestepisode a').first().text().trim();
    const latestEpisodeHref = $('.latestepisode a').first().attr('href').trim();
    const latestEpisode = { title: latestEpisodeTitle, href: latestEpisodeHref };
    
    const firstEpisodeTitle = $('.latestepisode a').last().text().trim();
    const firstEpisodeHref = $('.latestepisode a').last().attr('href').trim();
    const firstEpisode = { title: firstEpisodeTitle, href: firstEpisodeHref };
    
    const tags = [];
    $('.tagline a').each((index, element) => {
      tags.push($(element).text().trim());
    });
    
    const infos = {};
    $('.infoseries').each((index, element) => {
      const infoText = $(element).text();
      const infoArr = infoText.split(':');
      const key = infoArr[0].trim();
      const value = infoArr[1].trim();
      infos[key] = value;
    });
    
    const description = $('.entry-content.seriesdesc p').text().trim();
    
    const episodes = [];
    $('.episodelist .misha_posts_wrap2 li').each((index, element) => {
      const episodeTitle = $(element).find('a').text().trim();
      const episodeDate = $(element).find('.t3').text().trim();
      const episodeUrl = $(element).find('a').attr('href').trim();
      episodes.push({ episodeTitle, episodeDate, episodeUrl });
    });
    
    const animeData = {
      title,
      imgSrc,
      extra,
      latestEpisode,
      firstEpisode,
      tags,
      infos,
      description,
      episodes
    };
    
    res.json(animeData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch anime data' });
  }
});

module.exports = app;
