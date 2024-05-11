const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();

app.get('/episodeterbaru', async (req, res) => {
  try {
    const response = await axios.get('https://nontonanimeid.cyou/anime/kaijuu-8-gou/');
    const $ = cheerio.load(response.data);
    
    const title = $('.entry-title.cs').text();
    const imgSrc = $('.poster img').attr('src');
    
    const extra = {};
    $('.extra').find('span').each((index, element) => {
      extra[$(element).attr('class')] = $(element).text().trim();
    });
    
    const latestEpisodeTitle = $('.latestepisode a').first().text();
    const latestEpisodeHref = $('.latestepisode a').first().attr('href');
    const latestEpisode = { title: latestEpisodeTitle, href: latestEpisodeHref };
    
    const firstEpisodeTitle = $('.latestepisode a').last().text();
    const firstEpisodeHref = $('.latestepisode a').last().attr('href');
    const firstEpisode = { title: firstEpisodeTitle, href: firstEpisodeHref };
    
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
    
    const episodes = [];
    $('.episodelist .misha_posts_wrap2 li').each((index, element) => {
      const episodeTitle = $(element).find('a').text();
      const episodeDate = $(element).find('.t3').text();
      const episodeUrl = $(element).find('a').attr('href');
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
