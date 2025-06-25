import next from 'next';
import { app } from './app';
import { env } from './config/env';

const NextApp = next({ dev: env.NODE_ENV === 'development' });
const handle = NextApp.getRequestHandler();

NextApp.prepare().then(async () => {
  app.all(/(.*)/, (req, res) => handle(req, res));

  app.listen(env.PORT, () => {
    console.log(`\nServer running in ${env.NODE_ENV} mode at:`);
    console.log(`• Local: http://localhost:${env.PORT}\n`);
  });
});