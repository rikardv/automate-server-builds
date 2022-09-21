require('dotenv').config();
const { execSync } = require('child_process');
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3003;

// For these headers, a sigHashAlg of sha1 must be used instead of sha256
// GitHub: X-Hub-Signature
// Gogs:   X-Gogs-Signature
const sigHeaderName = 'X-Hub-Signature-256';
const sigHashAlg = 'sha256';

app.get('/portfolio-4ndXZIY9X1', (req, res) => {
  res.status(200).send('Request body was signed');
  git_pull('portfolio-v2');
  // build_prj('portfolio-v2');
});

app.post('/ytuploads-xaN8TzzEfr', verifyPostData, (req, res) => {
  res.status(200).send('Request body was signed');
  git_pull('ytubechannel-uploads');
  build_prj('ytubechannel-uploads');
});

app.post('/friend-movie-recommend-TOpubfNSeR', verifyPostData, (req, res) => {
  res.status(200).send('Request body was signed');
  git_pull('friend-movie-recommend');
});

app.post('/sampleprj', (req, res) => {
  res.status(200).send('Request body was signed');
});

app.use((err, req, res, next) => {
  if (err) console.error(err);
  res.status(403).send('Request body was not signed or verification failed');
});

app.get('*', (req, res) => {
  res.status(404).send('no found');
});

app.listen(port, () => {
  console.log(`automate build script listening on port ${port}`);
});

// Saves a valid raw JSON body to req.rawBody
// Credits to https://stackoverflow.com/a/35651853/90674
app.use(
  bodyParser.json({
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
      }
    },
  })
);

function verifyPostData(req, res, next) {
  if (!req.rawBody) {
    return next('Request body empty');
  }

  const sig = Buffer.from(req.get(sigHeaderName) || '', 'utf8');
  const hmac = crypto.createHmac(sigHashAlg, PROCESS.ENV.SECRET);
  const digest = Buffer.from(
    sigHashAlg + '=' + hmac.update(req.rawBody).digest('hex'),
    'utf8'
  );
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    return next(
      `Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`
    );
  }

  return next();
}

function git_pull(repo) {
  console.log(`pulling ${repo} from git...`);
  try {
    var pull = execSync(`git -C ../${repo} pull`).toString();
    console.log(pull);
  } catch (err) {
    console.log(`git pull from ${repo} failed...`);
  }
}

function build_prj(repo) {
  console.log(`building the ${repo} app...`);
  var cmd = `cd ../${repo}/client
    npm install
    npm run build
    `;

  try {
    var build = execSync(cmd).toString();
    console.log(build);
  } catch (e) {
    console.log(`npm run build for ${repo} failed...`);
  }
}
