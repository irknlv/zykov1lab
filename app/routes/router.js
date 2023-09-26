const express = require('express');
const router = express.Router();
const app = express();
const axios = require('axios');
const secretKey = 'secret';
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const apiURL = 'http://104.248.151.123:8000/api';

app.use(cookieParser());

router.get('/', async(req, res) => {
    res.render('login');
})
router.get('/signUp', async(req, res) => {

    res.render('register');
})
router.get('/profile', async(req, res) => {
  const token = req.cookies.token;
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  const decodedToken = jwt.decode(token);
  const user = await(
    axios.get(`${apiURL}/user/${decodedToken.login}`)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        console.error(error);
      })
  )
  const posts = await axios.get(`${apiURL}/myPosts`, config)
    .then(response => {
      const data = response.data;
      const postsWithUnwrappedMediaFiles = data.map(post => {
        return {
          ...post,
          mediaFiles: post.mediaFiles.map(mediaFile => {
            return {
              id: mediaFile.id,
              type: mediaFile.type,
              url: mediaFile.url.replace("/media", ""),
              postId: mediaFile.postId,
            };
          }),
        };
      });
      return postsWithUnwrappedMediaFiles;
    })
    .catch(error => {
      console.error(error);
    });
  console.log(JSON.stringify(posts, null, 2));
  res.render('profile', {posts, user, decodedToken});
})
router.post('/request/login', async (req, res) => {
  const apiURL = 'http://104.248.151.123:8000/api/login';
  const postData = await({
      loginText: req.body.loginText,
      password: req.body.password,
  });

  axios
      .post(apiURL, postData)
      .then(function (response) {
          console.log(response.data.token)
          const responseData = response.data;
          const token = responseData.token;
          console.log(token)
          res.cookie('token', token, {
            maxAge: 3600000,
            secure: false,
            httpOnly: true,
          });
          res.redirect('/profile');
      })
      .catch(function (error) {
          console.error('Error while sending POST request:', error);
          res.status(500).send(error.response.data.message);
      });
});
router.post('/request/signUp', async (req, res) => {
  const apiURL = 'http://104.248.151.123:8000/api/register';
  const postData = await({
      fullname: req.body.fullname,
      email: req.body.email,
      login: req.body.login,
      password: req.body.password,
  });

  axios
      .post(apiURL, postData)
      .then(function (response) {
          console.log('Successful response from the external API:', response.data);
          res.render('login'); 
      })
      .catch(function (error) {
          console.error('Error while sending POST request:', error);
          res.status(500).send(error.response.data.message);
      });
});

module.exports = router;